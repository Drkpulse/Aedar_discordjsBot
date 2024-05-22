const schedule = require('node-schedule');

module.exports = async (client, handler) => {

 // Initialize repeating events
 client.repeatingEvents = client.repeatingEvents || {};
 const guilds = client.guilds.cache.map(guild => guild);
 for (const guild of guilds) {
	 const events = await guild.scheduledEvents.fetch();
	 events.forEach(event => {
		 if (event.description.includes('[weekly]')) {
			 client.repeatingEvents[event.id] = {
				 name: event.name,
				 description: event.description,
				 scheduledStartTimestamp: event.scheduledStartTimestamp,
				 scheduledEndTimestamp: event.scheduledEndTimestamp,
				 privacyLevel: event.privacyLevel,
				 entityType: event.entityType,
				 entityMetadata: event.entityMetadata,
				 guild: event.guild
			 };

			 // Schedule a reminder for one day before the event starts
			 const reminderTime = new Date(new Date(event.scheduledStartTimestamp) - 24 * 60 * 60 * 1000);
			 schedule.scheduleJob(reminderTime, async () => {
				 const roleMatch = event.description.match(/<@&(\d+)>/);
				 if (roleMatch) {
					 const roleId = roleMatch[1];
					 const role = await guild.roles.fetch(roleId);
					 const channel = guild.channels.cache.get(event.channelId);
					 if (channel && role) {
						 await channel.send(`${role}, the event "${event.name}" is happening in 24 hours!`);
					 }
				 }
			 });
		 }
	 });
 }
};

