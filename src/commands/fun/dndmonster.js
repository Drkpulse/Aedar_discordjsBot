const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dndmonster')
		.setDescription('Fetches information about a Dungeons & Dragons monster')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Name of the monster')
				.setRequired(true)),

	run: async ({ interaction }) => {
		const monsterName = interaction.options.getString('name');

		try {
			const response = await axios.get(`https://www.dnd5eapi.co/api/monsters/${monsterName.toLowerCase()}`);
			const monsterData = response.data;

			if (monsterData) {
				const monsterInfo = `
					**Name:** ${monsterData.name}
					**Size:** ${monsterData.size}
					**Type:** ${monsterData.type}
					**Alignment:** ${monsterData.alignment}
					**Hit Points:** ${monsterData.hit_points}
					**Armor Class:** ${monsterData.armor_class}
					**Challenge Rating:** ${monsterData.challenge_rating}
					**Description:** ${monsterData.desc.join(' ')}
				`;

				await interaction.reply({ content: monsterInfo, ephemeral: false });
			} else {
				throw new Error('No monster found with the specified name.');
			}
		} catch (error) {
			console.error('Error fetching monster:', error);
			await interaction.reply({ content: 'An error occurred while fetching the monster information. Please try again later.', ephemeral: true });
		}
	},
	options: {
		cooldown: '10s',
	},
};
