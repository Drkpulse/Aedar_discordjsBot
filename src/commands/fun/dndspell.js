const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dndspell')
		.setDescription('Fetches information about a Dungeons & Dragons spell')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Name of the spell')
				.setRequired(true)),

	run: async ({ interaction }) => {
		const spellName = interaction.options.getString('name');

		try {
			const response = await axios.get(`https://www.dnd5eapi.co/api/spells/${spellName.toLowerCase()}`);
			const spellData = response.data;

			if (spellData) {
				const spellInfo = `
					**Name:** ${spellData.name}
					**Level:** ${spellData.level}
					**Casting Time:** ${spellData.casting_time}
					**Range:** ${spellData.range}
					**Components:** ${spellData.components.join(', ')}
					**Duration:** ${spellData.duration}
					**Description:** ${spellData.desc.join(' ')}
				`;

				await interaction.reply({ content: spellInfo, ephemeral: false });
			} else {
				throw new Error('No spell found with the specified name.');
			}
		} catch (error) {
			console.error('Error fetching spell:', error);
			await interaction.reply({ content: 'An error occurred while fetching the spell information. Please try again later.', ephemeral: true });
		}
	},
	options: {
		cooldown: '10s',
	},
};
