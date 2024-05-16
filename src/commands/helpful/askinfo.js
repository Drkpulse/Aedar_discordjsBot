const cooldowns = require('../../validations/cooldowns');


module.exports = {
	data:{
		name: 'info',
		description: 'Informações sobre os Patins no Porto',
	},

	run: async ({interaction, client, handler}) => {
	interaction.reply(`Olá tudo bem`);
        // Log command usage
        const dateTime = new Date().toISOString();
        const user = interaction.user.tag;
        const interactionId = interaction.commandName;

        console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
	},
	options: {
		//cooldown: '1h',/
		//devOnly: true,
		//userPermissions: ['Adminstrator'],
		//botPermissions: ['BanMembers'],
		//deleted: true,
	},
  };
