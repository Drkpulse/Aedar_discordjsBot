const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eventrepeat')
        .setDescription('Marks an event to repeat after it ends.'),

    run: async ({ interaction, client }) => {
        try {
            const events = await client.guilds.cache.get(interaction.guildId).scheduledEvents.fetch();
            if (!events.size) throw new Error('No events found');

            const selectOptions = events.map((event, id) =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(event.name)
                    .setValue(id)
            );

            const eventSelectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_event')
                .setPlaceholder('Select an event')
                .addOptions(selectOptions);

            const response = await interaction.reply({
                content: 'Select an event to repeat:',
                components: [new ActionRowBuilder().addComponents(eventSelectMenu)],
                ephemeral: true
            });

            const filter = i => i.customId === 'select_event' && i.user.id === interaction.user.id;
            const collected = await response.awaitMessageComponent({ filter, componentType: ComponentType.StringSelect });

            const eventId = collected.values[0];
            const event = events.get(eventId);
            const existingIntervalMatch = event.description.match(/\[(hourly|daily|weekly|monthly)\]/);
            const existingInterval = existingIntervalMatch ? existingIntervalMatch[1] : null;

            if (existingInterval) {
                const changeIntervalButton = new ButtonBuilder()
                    .setCustomId('change_interval')
                    .setLabel('Change Interval')
                    .setStyle(ButtonStyle.Primary);

                await collected.update({
                    content: `Event ${event.name} already has a repeat interval set to [${existingInterval}]. Do you want to change it?`,
                    components: [new ActionRowBuilder().addComponents(changeIntervalButton)],
                    ephemeral: true
                });

                const changeIntervalFilter = i => i.customId === 'change_interval' && i.user.id === interaction.user.id;
                const changeIntervalCollected = await interaction.channel.awaitMessageComponent({ filter: changeIntervalFilter, componentType: ComponentType.Button });

                await promptForNewInterval(changeIntervalCollected, event);
            } else {
                await promptForNewInterval(collected, event);
            }
        } catch (error) {
            console.error('Error setting up event repetition:', error);
            await interaction.reply({ content: `Error setting up event repetition: ${error.message}`, ephemeral: true });
        }
    },
	options: {
		//devOnly: true,
		userPermissions: ['Adminstrator'],
		//botPermissions: [],
		//deleted: false,
	},
};

async function promptForNewInterval(interaction, event) {
    const intervalSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_interval')
        .setPlaceholder('Select repeat interval')
        .addOptions(
            { label: 'Hourly', value: 'hourly' },
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' }
        );

    await interaction.update({
        content: `Select a new repeat interval for ${event.name}:`,
        components: [new ActionRowBuilder().addComponents(intervalSelectMenu)],
        ephemeral: true
    });

    const filter = i => i.customId === 'select_interval' && i.user.id === interaction.user.id;
    const collected = await interaction.channel.awaitMessageComponent({ filter, componentType: ComponentType.StringSelect });

    const repeatInterval = collected.values[0];
    let updatedDescription = event.description.replace(/\[(hourly|daily|weekly|monthly)\]/, '');

    // Check if description ends with two new lines
    if (!updatedDescription.endsWith('\n\n')) {
        updatedDescription += '\n\n';
    }

    updatedDescription += `[${repeatInterval}]`; // Adding repeat interval

    await event.edit({ description: updatedDescription });
    await collected.update({ content: `Event ${event.name} is set to repeat ${repeatInterval}.`, components: [] });
}

