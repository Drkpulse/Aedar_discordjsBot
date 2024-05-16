const { ApplicationCommandType } = require("discord.js");

module.exports = {
	data: {
		name: 'content',
		type: ApplicationCommandType.Message,
	},

	run: ({ interaction, client, handler }) => {
		interaction.reply(`The message is: ${interaction.targetMessage.content}`);

	// Log command usage
	const dateTime = new Date().toISOString();
	const user = interaction.user.tag;
	const interactionId = interaction.commandName;

	console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
	},

	options: {
		devOnly: true,
		userPermissions: [],
		botPermissions: [],
		deleted: false,
	},
};
