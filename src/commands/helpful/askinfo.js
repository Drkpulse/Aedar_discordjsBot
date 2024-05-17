const cooldowns = require('../../validations/cooldowns');


module.exports = {
	data:{
		name: 'info',
		description: 'Informações sobre os Patins no Porto',
	},

	run: async ({interaction, client, handler}) => {
	interaction.reply(`Placeholder para informações sobre os Patins no Porto`);
		// Log command usage
		 const date = new Date();
		 const dateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
		 const user = interaction.user.tag;
		 const interactionId = interaction.commandName;

		 console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
	},
	options: {
		cooldown: '10s',
		//devOnly: true,
		//userPermissions: ['Adminstrator'],
		//botPermissions: ['BanMembers'],
		//deleted: true,
	},
  };
