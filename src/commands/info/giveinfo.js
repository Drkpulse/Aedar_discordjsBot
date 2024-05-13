const { ApplicationCommandType } = require("discord.js");

module.exports = {
	data: {
		name: 'Give Info',
		type: ApplicationCommandType.Message,
	},

	run: ({ interaction, client, handler }) => {
		const mentionedUser = interaction.targetMessage.author.toString();
		interaction.reply(`Hey ${mentionedUser}!`);
	},

	options: {
		devOnly: true,
		userPermissions: [],
		botPermissions: [],
		deleted: false,
	},
};
