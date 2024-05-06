const { ActivityType } = require('discord.js');

module.exports = (client) => {
	console.log(`${client.user.tag} is online with ID: ${client.user.id}`);
	// Get information about the guilds the bot is in
	const guilds = client.guilds.cache;
	console.log(`Number of guilds: ${guilds.size}`);
	// Some Guild Informations
	guilds.forEach(guild => {
		console.log(`**** ${guild.name} ****`);
		console.log(`Guild ID: ${guild.id}`);
		console.log(`Member Count: ${guild.memberCount}`);
	});

	// Start Bot Status Rotation
	setInterval(() => {
		let random = Math.floor(Math.random() * status.length);
		client.user.setActivity(status[random]);
	}, 60000); // Change this value to change interval ( 10000 = 10 sec)

	// Calculate the time it took for the bot to become ready
		const uptimeInSeconds = (client.readyAt - client.readyTimestamp) / 1000;
		console.log(`Time taken to become ready: ${uptimeInSeconds.toFixed(2)} seconds`);

};

let status = [
	{
		name: 'Testing',
		type: ActivityType.Competing,
	},
	{
		name: 'Nothing',
		type: ActivityType.Playing,
	},
	{
		name: 'Ai Chan secret stream',
		type: ActivityType.Streaming,
		url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
	},
	{
		name: 'ASMR Kids Screaming',
		type: ActivityType.Listening,
	},
	{
		name: 'Turtles playful time',
		type: ActivityType.Watching,
	},
]
