const cooldowns = require('../../validations/cooldowns');


module.exports = {
	data:{
		name: 'invite',
		description: 'Como dar invite a alguém',
	},

	run: async ({interaction, client, handler}) => {
	interaction.reply(`Para receber um invite é necessário comparecer num dos nossos eventos principais`);
        // Log command usage
		 const date = new Date();
		 const dateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
		 const user = interaction.user.tag;
		 const interactionId = interaction.commandName;

		 console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
	},
	options: {
		cooldown: '1m',
		devOnly: true,
		//userPermissions: ['Adminstrator'],
		//botPermissions: ['BanMembers'],
		//deleted: true,
	},
  };
