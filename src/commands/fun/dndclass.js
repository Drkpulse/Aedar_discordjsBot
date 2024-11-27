const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dndclass')
		.setDescription('Fetches information about a Dungeons & Dragons class')
		.addStringOption(option =>
			option.setName('class')
				.setDescription('The name of the D&D class to fetch information about')
				.setRequired(false)), // Make this option optional

	run: async ({ interaction }) => {
		const className = interaction.options.getString('class');

		if (className) {
			// If a class name is provided, fetch the class details directly
			try {
				const response = await axios.get(`https://www.dnd5eapi.co/api/classes/${className.toLowerCase()}`);
				const classData = response.data;

				if (classData) {
					const classInfo = `
						**Name:** ${classData.name}
						**Hit Die:** ${classData.hit_die}
						**Primary Ability:** ${classData.primary_ability.join(', ')}
						**Saving Throws:** ${classData.saving_throws.join(', ')}
						**Proficiencies:** ${classData.proficiencies.map(p => p.name).join(', ')}
						**Description:** ${classData.desc.join(' ')}
					`;

					await interaction.reply({ content: classInfo, ephemeral: false });
				} else {
					await interaction.reply({ content: 'No class found with the specified name.', ephemeral: true });
				}
			} catch (error) {
				console.error('Error fetching class details:', error);
				await interaction.reply({ content: 'An error occurred while fetching the class information. Please try again later.', ephemeral: true });
			}
		} else {
			// If no class name is provided, fetch all classes and show the dropdown
			try {
				const response = await axios.get('https://www.dnd5eapi.co/api/classes');
				const classes = response.data.results;

				if (classes.length > 0) {
					const classOptions = classes.map(cls => ({
						label: cls.name,
						value: cls.index,
					}));

					const selectMenu = new StringSelectMenuBuilder()
						.setCustomId('classSelect')
						.setPlaceholder('Select a D&D class')
						.addOptions(classOptions);

					const row = new ActionRowBuilder().addComponents(selectMenu);

					await interaction.reply({ content: 'Please select a D&D class:', components: [row] });
				} else {
					await interaction.reply({ content: 'No classes found.', ephemeral: true });
				}
			} catch (error) {
				console.error('Error fetching classes:', error);
				await interaction.reply({ content: 'An error occurred while fetching the classes. Please try again later.', ephemeral: true });
			}
		}
	},

	// Handle the interaction when a class is selected
	interactionCreate: async (interaction) => {
		if (!interaction.isSelectMenu()) return;

		if (interaction.customId === 'classSelect') {
			const selectedClass = interaction.values[0];

			try {
				const response = await axios.get(`https://www.dnd5eapi.co/api/classes/${selectedClass}`);
				const classData = response.data;

				if (classData) {
					const classInfo = `
						**Name:** ${classData.name}
						**Hit Die:** ${classData.hit_die}
						**Primary Ability:** ${classData.primary_ability.join(', ')}
						**Saving Throws:** ${classData.saving_throws.join(', ')}
						**Proficiencies:** ${classData.proficiencies.map(p => p.name).join(', ')}
						**Description:** ${classData.desc.join(' ')}
					`;

					await interaction.reply({ content: classInfo, ephemeral: false });
				} else {
					await interaction.reply({ content: 'No class found with the specified name.', ephemeral: true });
				}
			} catch (error) {
				console.error('Error fetching class details:', error);
				await interaction.reply({ content: 'An error occurred while fetching the class information. Please try again later.', ephemeral: true });
			}
		}
	},
	options: {
		cooldown: '10s',
	},
};
