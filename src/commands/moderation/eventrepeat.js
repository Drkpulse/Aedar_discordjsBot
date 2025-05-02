const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eventrepeat')
		.setDescription('Marks an event to repeat after it ends.'),

	run: async ({ interaction, client }) => {
		try {
			const events = await client.guilds.cache.get(interaction.guildId).scheduledEvents.fetch();
			if (!events.size) {
				return interaction.reply({ content: 'No events found in this guild.', ephemeral: true });
			}

			const selectOptions = events.map((event, id) =>
				new StringSelectMenuOptionBuilder()
					.setLabel(event.name)
					.setValue(id)
			);

			const eventSelectMenu = new StringSelectMenuBuilder()
				.setCustomId('select_event')
				.setPlaceholder('Select an event')
				.addOptions(selectOptions);

			await interaction.reply({
				content: 'Select an event to repeat:',
				components: [new ActionRowBuilder().addComponents(eventSelectMenu)],
				ephemeral: true
			});

			const filter = i => i.customId === 'select_event' && i.user.id === interaction.user.id;
			const collected = await interaction.channel.awaitMessageComponent({ filter, componentType: ComponentType.StringSelect });

			const eventId = collected.values[0];
			const event = events.get(eventId);
			const existingIntervalMatch = event.description.match(/\[(hourly|daily|weekly|monthly)\]/);
			const existingInterval = existingIntervalMatch ? existingIntervalMatch[1] : null;

			if (existingInterval) {
				const changeIntervalButton = new ButtonBuilder()
					.setCustomId('change_interval')
					.setLabel('Change Interval')
					.setStyle(ButtonStyle.Success);

				const keepIntervalButton = new ButtonBuilder()
					.setCustomId('keep_interval')
					.setLabel('Keep Interval')
					.setStyle(ButtonStyle.Danger);

				await collected.update({
					content: `Event ${event.name} already has a repeat interval set to [${existingInterval}]. Do you want to change it?`,
					components: [new ActionRowBuilder().addComponents(changeIntervalButton, keepIntervalButton)],
					ephemeral: true
				});

				const changeIntervalFilter = i => (i.customId === 'change_interval' || i.customId === 'keep_interval') && i.user.id === interaction.user.id;
				const intervalDecision = await collected.channel.awaitMessageComponent({ filter: changeIntervalFilter, componentType: ComponentType.Button });

				if (intervalDecision.customId === 'change_interval') {
					await promptForNewInterval(intervalDecision, event);
				} else {
					await intervalDecision.update({ content: `Event ${event.name} will keep the current interval [${existingInterval}].`, components: [] });
					return;
				}
			} else {
				await promptForNewInterval(collected, event);
			}
		} catch (error) {
			console.error('Error setting up event repetition:', error);
			if (!interaction.replied && !interaction.deferred) {
				await interaction.reply({ content: `Error setting up event repetition: ${error.message}`, ephemeral: true });
			} else {
				await interaction.followUp({ content: `Error setting up event repetition: ${error.message}`, ephemeral: true });
			}
		}
	},
	options: {
		cooldown: '30s',
		userPermissions: ['Administrator'],
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
	try {
		const collected = await interaction.channel.awaitMessageComponent({ filter, componentType: ComponentType.StringSelect, time: 15000 });

		const repeatInterval = collected.values[0];
		let updatedDescription = event.description.replace(/\[(hourly|daily|weekly|monthly)\]/, '');

		if (!updatedDescription.endsWith('\n\n')) {
			updatedDescription += '\n\n';
		}

		updatedDescription += `[${repeatInterval}]`; // Adding repeat interval

		await event.edit({ description: updatedDescription });
		await collected.update({ content: `Event ${event.name} is set to repeat ${repeatInterval}.`, components: [] });
	} catch (error) {
		console.error('Error in promptForNewInterval:', error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'No interval was selected in time. Please try again.', ephemeral: true });
		} else {
			await interaction.update({ content: 'No interval was selected in time. Please try again.', components: [] });
		}
	}
}
