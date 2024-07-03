const { ApplicationCommandType } = require("discord.js");

module.exports = {
	data: {
		name: 'Give Info',
		type: ApplicationCommandType.Message,
	},

	run: ({ interaction, client, handler }) => {
		const mentionedUser = interaction.targetMessage.author.toString();
		interaction.reply(`Olá ${mentionedUser} gostava que atualizasses as tuas roles <id:customize> \n Obrigado :blush: `);
	},

	options: {
		userPermissions: ['Adminstrator'],
	},
};
