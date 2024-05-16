const { ApplicationCommandType } = require("discord.js");

module.exports = {
	data: {
		name: 'Give Info',
		type: ApplicationCommandType.Message,
	},

	run: ({ interaction, client, handler }) => {
		const mentionedUser = interaction.targetMessage.author.toString();
		interaction.reply(`Hey ${mentionedUser}!`);
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
