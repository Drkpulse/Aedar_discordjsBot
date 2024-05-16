const { ApplicationCommandType } = require("discord.js");

module.exports = {
	data: {
		name: 'Give Info',
		type: ApplicationCommandType.Message,
	},

	run: ({ interaction, client, handler }) => {
		const mentionedUser = interaction.targetMessage.author.toString();
		interaction.reply(`Placeholder ${mentionedUser} para informações sobre os Patins no Porto com menção da pessoa, Só admins podem user ${mentionedUser}!`);
        // Log command usage
		 const date = new Date();
		 const dateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
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
