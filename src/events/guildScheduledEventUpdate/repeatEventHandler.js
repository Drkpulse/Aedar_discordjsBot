const { GuildScheduledEventStatus, CDN, GuildScheduledEventManager } = require('discord.js');
//const { setupEvent } = require('../../helpers/eventRecreate');

const EVENT_START_HOURLY = 3600000;
const EVENT_START_DAILY = 86400000;
const EVENT_START_WEEKLY = 604800000;
const EVENT_START_MONTHLY = 2628000000;

module.exports = async (before, after, client) => {
	console.log(`Scheduled event ${before.name} updated`);


	//trigger on starting an event
	if ( before.status === GuildScheduledEventStatus.Active && after.status === GuildScheduledEventStatus.Completed) {
		if(before.description.includes("[hourly]")) {
			setupEvent(before, after, EVENT_START_HOURLY, client)
		} else if (before.description.includes("[daily]")) {
			setupEvent(before, after, EVENT_START_DAILY, client)
		} else if (before.description.includes("[weekly]")) {
			setupEvent(before, after, EVENT_START_WEEKLY, client)
		} else if (before.description.includes("[monthly]")) {
			setupEvent(before, after, EVENT_START_MONTHLY, client)
		}
	}
};

async function setupEvent(before, after, startingTimeBasedOnLastEvent, client) {
	try {
		console.log("Setting up event repetition");
		const guild = await client.guilds.fetch(before.guildId);
		const cdn = new CDN();
		const imageLink = cdn.guildScheduledEventCover(before.id, before.image, {size: 4096,});

		//Create new event using the information from the old event
		const event_manager = new GuildScheduledEventManager(guild);
		await event_manager.create({
			name: before.name,
			description: before.description,
			scheduledStartTime: before.scheduledStartTimestamp + startingTimeBasedOnLastEvent,
			scheduledEndTime: before.scheduledEndTimestamp + startingTimeBasedOnLastEvent,
			privacyLevel: 2,
			entityType: 3,
			entityMetadata: before.entityMetadata,
			image: imageLink
		});
		console.log(`Event ${before.name} has been scheduled to repeat.`);
	} catch (error) {
		console.error('Error setting up event repetition:', error);
	}
	}
