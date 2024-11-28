// manageCommands.js
const { SlashCommandBuilder } = require('discord.js');
const { isCommandActive, setCommandState } = require('../utils/commandManager');
const fs = require('fs');
const path = require('path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('managecommands')
		.setDescription('List all commands and their states, or toggle a command state')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The command to toggle (leave blank to list all)')
				.setRequired(false)
				.addChoices(
					// Dynamically load command names
					...fs.readdirSync(path.join(__dirname)).filter(file => file.endsWith('.js')).map(file => ({
						name: file.replace('.js', ''), // Remove the .js extension
						value: file.replace('.js', '')
					}))
				)),

	run: async ({ interaction }) => {
		const commandName = interaction.options.getString('command');

		if (!commandName) {
			// List all commands and their states
			const commandFiles = fs.readdirSync(path.join(__dirname)).filter(file => file.endsWith('.js'));
			const commandStates = commandFiles.map(file => {
				const name = file.replace('.js', '');
				const state = isCommandActive(name) ? 'Active' : 'Inactive';
				return `**${name}**: ${state}`;
			});

			const response = commandStates.join('\n');
			await interaction.reply(`Here are the commands and their states:\n${response}`);
		} else {
			// Toggle the state of the specified command
			const currentState = isCommandActive(commandName);
			setCommandState(commandName, !currentState);
			const newState = !currentState ? 'Active' : 'Inactive';

			await interaction.reply(`Command **${commandName}** is now **${newState}**.`);
		}
	},
};
