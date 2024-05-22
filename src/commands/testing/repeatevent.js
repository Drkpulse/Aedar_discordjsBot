const { SlashCommandBuilder } = require('discord.js');
const schedule = require('node-schedule');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('repeatevent')
        .setDescription('Mark a guild event for weekly repetition and set reminders')
        .addStringOption(option =>
            option.setName('eventid')
                .setDescription('ID of the event to repeat weekly')
                .setRequired(true)),

    run: async ({ interaction, client }) => {
        await interaction.deferReply({ ephemeral: true });

        const eventId = interaction.options.getString('eventid');
        const guild = interaction.guild;

        try {
            const event = await guild.scheduledEvents.fetch(eventId);

            if (!event) {
                return interaction.editReply('Event not found.');
            }

            const updatedDescription = event.description.includes('[weekly]') ? event.description : `${event.description} [weekly]`;

            await event.edit({ description: updatedDescription });

            // Schedule a reminder for one day before the event starts
            const reminderTime = new Date(new Date(event.scheduledStartTimestamp) - 24 * 60 * 60 * 1000);
            schedule.scheduleJob(reminderTime, async () => {
                const roleMatch = updatedDescription.match(/<@&(\d+)>/);
                if (roleMatch) {
                    const roleId = roleMatch[1];
                    const role = await guild.roles.fetch(roleId);
                    const channel = guild.channels.cache.get(event.channelId);
                    if (channel && role) {
                        await channel.send(`${role}, the event "${event.name}" is happening in 24 hours!`);
                    }
                }
            });

            // Store event data in memory to be used when the event ends
            client.repeatingEvents = client.repeatingEvents || {};
            client.repeatingEvents[eventId] = {
                name: event.name,
                description: updatedDescription,
                scheduledStartTimestamp: event.scheduledStartTimestamp,
                scheduledEndTimestamp: event.scheduledEndTimestamp,
                privacyLevel: event.privacyLevel,
                entityType: event.entityType,
                entityMetadata: event.entityMetadata,
                guild: event.guild
            };

            await interaction.editReply(`Event "${event.name}" marked for weekly repetition and reminder set.`);
        } catch (error) {
            console.error('Error setting up event repetition:', error);
            await interaction.editReply('There was an error setting up the event repetition.');
        }
    }
};
