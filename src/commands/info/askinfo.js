const cooldowns = require('../../validations/cooldowns');


module.exports = {
	data:{
		name: 'info',
		description: 'Informações sobre os Patins no Porto',
	},

	run: async ({interaction, client, handler}) => {
	interaction.reply(`Olá tudo bem`);
	},
	options: {
		//cooldown: '1h',/
		//devOnly: true,
		//userPermissions: ['Adminstrator'],
		//botPermissions: ['BanMembers'],
		//deleted: true,
	},
  };
