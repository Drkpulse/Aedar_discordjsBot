const { ActivityType } = require('discord.js');

module.exports = async (client, handler) => {
	// Array of status configurations
	const statuses = [
		{
			name: 'compiling code 🖥️',
			type: ActivityType.Playing,
		},
		{
			name: 'hacking the mainframe 🕵️‍♂️',
			type: ActivityType.Watching,
		},
		{
			name: 'exploring infinite loops 🔁',
			type: ActivityType.Streaming,
			url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
		},
		{
			name: 'debugging life 🐞',
			type: ActivityType.Listening,
		},
		{
			name: 'learning binary 🤖',
			type: ActivityType.CustomStatus,
		},
	];

	const setBotPresence = () => {
		try {
			const random = Math.floor(Math.random() * statuses.length);
			const status = statuses[random];
			//console.log('Setting bot presence:', status);
			client.user.setPresence({
				activities: [{
					name: status.name,
					type: status.type,
					url: status.url || null,
				}],
				status: 'online',
			});
			//console.log('Bot presence set to:', status.name);
		} catch (error) {
			console.error('Error in setBotPresence function:', error);
		}
	};

	setBotPresence(); // Set initial bot presence

	// Set bot presence every 10 seconds
	setInterval(() => {
		setBotPresence();
	}, 10000);
};
