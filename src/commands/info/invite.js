const cooldowns = require('../../validations/cooldowns');


module.exports = {
	data:{
		name: 'invite',
		description: 'Como dar invite a alguém',
	},

	run: async ({interaction, client, handler}) => {
	interaction.reply(`Para receber um invite é necessário comparecer num dos nossos eventos principais`);
	},
	options: {
		//cooldown: '1h',
		devOnly: true,
		//userPermissions: ['Adminstrator'],
		//botPermissions: ['BanMembers'],
		//deleted: true,
	},
  };
