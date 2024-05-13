const { ApplicationCommandType } = require("discord.js");

module.exports = {
	data: {
		name: 'content',
		type: ApplicationCommandType.Message,
	},

	run: ({ interaction, client, handler }) => {
		interaction.reply(`The message is: ${interaction.targetMessage.content}`);
	},

	options: {
		devOnly: true,
		userPermissions: [],
		botPermissions: [],
		deleted: false,
	},
};
