const cooldowns = require('../../validations/cooldowns');


module.exports = {
	data: {
		name: 'ping',
		description: 'Pong!',
	},

	run: async ({interaction, client, handler}) => {
	await interaction.deferReply();

	const reply = await interaction.fetchReply();

	const ping = reply.createdTimestamp - interaction.createdTimestamp;

	interaction.editReply(
		`Pong! Client ${ping}ms | Websocket: ${client.ws.ping}ms`
	);

	// Log command usage
	const dateTime = new Date().toISOString();
	const user = interaction.user.tag;
	const interactionId = interaction.name;

	console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
	},
	options: {
		//cooldown: '1h',
		devOnly: true,
		//userPermissions: ['Adminstrator'],
		//botPermissions: ['BanMembers'],
		//deleted: true,
	},
  };
