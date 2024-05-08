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
	},
	options: {
		//cooldown: '1h',
		devOnly: true,
		//userPermissions: ['Adminstrator'],
		//botPermissions: ['BanMembers'],
		//deleted: true,
	},
  };
