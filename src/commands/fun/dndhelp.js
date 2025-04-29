const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dndinfo')
		.setDescription('Fetches information about D&D resources'),

	run: async ({ interaction }) => {
		try {
			// Fetch the root endpoint to get all available resources
			const response = await axios.get('https://www.dnd5eapi.co/api/');
			const resources = Object.keys(response.data);

			// Create a dropdown menu for resources
			const resourceOptions = resources.map(resource => ({
				label: resource.charAt(0).toUpperCase() + resource.slice(1),
				value: resource,
			}));

			const selectMenu = new StringSelectMenuBuilder()
				.setCustomId('resourceSelect')
				.setPlaceholder('Select a D&D resource')
				.addOptions(resourceOptions);

			const row = new ActionRowBuilder().addComponents(selectMenu);

			await interaction.reply({ content: 'Please select a D&D resource:', components: [row] });
		} catch (error) {
			console.error('Error fetching resources:', error);
			await interaction.reply({ content: 'An error occurred while fetching resources. Please try again later.', ephemeral: true });
		}
	},

	interactionCreate: async (interaction) => {
		if (!interaction.isSelectMenu()) return;

		if (interaction.customId === 'resourceSelect') {
			const selectedResource = interaction.values[0];

			try {
				// Fetch the selected resource
				const response = await axios.get(`https://www.dnd5eapi.co/api/${selectedResource}`);
				const results = response.data.results;

				if (results.length > 0) {
					// Create a dropdown menu for specific items in the selected resource
					const itemOptions = results.map(item => ({
						label: item.name,
						value: item.index,
					}));

					const selectMenu = new StringSelectMenuBuilder()
						.setCustomId('itemSelect')
						.setPlaceholder(`Select a ${selectedResource}`)
						.addOptions(itemOptions);

					const row = new ActionRowBuilder().addComponents(selectMenu);

					await interaction.update({ content: `Please select a ${selectedResource}:`, components: [row] });
				} else {
					await interaction.update({ content: `No items found for ${selectedResource}.`, components: [] });
				}
			} catch (error) {
				console.error(`Error fetching ${selectedResource}:`, error);
				await interaction.update({ content: `An error occurred while fetching ${selectedResource}. Please try again later.`, components: [] });
			}
		} else if (interaction.customId === 'itemSelect') {
			const selectedItem = interaction.values[0];
			const resource = interaction.message.content.match(/Select a (\w+):/)[1].toLowerCase();

			try {
				// Fetch details of the selected item
				const response = await axios.get(`https://www.dnd5eapi.co/api/${resource}/${selectedItem}`);
				const itemData = response.data;

				let details = `**Name:** ${itemData.name}\n`;

				// Dynamically construct details from the fetched item data
				for (const [key, value] of Object.entries(itemData)) {
					if (typeof value === 'string') {
						details += `**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value}\n`;
					} else if (Array.isArray(value)) {
						details += `**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value.map(v => (v.name || v)).join(', ')}\n`;
					}
				}

				await interaction.update({ content: details, components: [] });
			} catch (error) {
				console.error('Error fetching item details:', error);
				await interaction.update({ content: 'An error occurred while fetching item details. Please try again later.', components: [] });
			}
		}
	},
	options: {
		cooldown: '10s',
	},
};
