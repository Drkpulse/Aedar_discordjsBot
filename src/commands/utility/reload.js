const { ReloadType } = require('commandkit');
const cooldowns = require('../../validations/cooldowns');
const { Events } = require('discord.js');


module.exports = {
	data: {
		name: 'reload',
		description: 'Reloads all Commands',
	},

	run: async ({interaction, client, handler}) => {
	await interaction.deferReply({ ephemeral: true });

	await handler.reloadCommands();
	await handler.reloadEvents();
	await handler.reloadValidations();

	interaction.followUp({ content: 'All Reloaded', ephemeral: true });

	// Log command usage
	const date = new Date();
	const dateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
	const user = interaction.user.tag;
	const interactionId = interaction.commandName;

	console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
	},
	options: {
		devOnly: true,
	},
  };
