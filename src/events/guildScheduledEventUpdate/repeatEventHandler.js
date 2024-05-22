const schedule = require('node-schedule');

module.exports = async (client, oldEvent, newEvent) => {
    if (newEvent.status === 'COMPLETED' && newEvent.description.includes('[weekly]')) {
        const eventData = client.repeatingEvents ? client.repeatingEvents[newEvent.id] : null;

        if (eventData) {
            const newStartTime = new Date(eventData.scheduledStartTimestamp + 7 * 24 * 60 * 60 * 1000); // Next week
            const newEndTime = new Date(eventData.scheduledEndTimestamp + 7 * 24 * 60 * 60 * 1000); // Next week

            try {
                const newEvent = await eventData.guild.scheduledEvents.create({
                    name: eventData.name,
                    description: eventData.description,
                    scheduledStartTime: newStartTime,
                    scheduledEndTime: newEndTime,
                    privacyLevel: eventData.privacyLevel,
                    entityType: eventData.entityType,
                    entityMetadata: eventData.entityMetadata
                });

                // Schedule a reminder for one day before the new event starts
                const reminderTime = new Date(newStartTime - 24 * 60 * 60 * 1000);
                schedule.scheduleJob(reminderTime, async () => {
                    const roleMatch = eventData.description.match(/<@&(\d+)>/);
                    if (roleMatch) {
                        const roleId = roleMatch[1];
                        const role = await eventData.guild.roles.fetch(roleId);
                        const channel = eventData.guild.channels.cache.get(newEvent.channelId);
                        if (channel && role) {
                            await channel.send(`${role}, the event "${eventData.name}" is happening in 24 hours!`);
                        }
                    }
                });

                // Update the stored event data with the new event's ID
                delete client.repeatingEvents[newEvent.id];
                client.repeatingEvents[newEvent.id] = {
                    ...eventData,
                    scheduledStartTimestamp: newStartTime,
                    scheduledEndTimestamp: newEndTime
                };
            } catch (error) {
                console.error('Error repeating event:', error);
            }
        }
    }
};
