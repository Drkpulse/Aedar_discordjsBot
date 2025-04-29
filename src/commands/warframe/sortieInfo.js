const { SlashCommandBuilder } = require('discord.js');
const { getWarframeSortie } = require('../../helpers/warframeapi.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sortieinfo')
		.setDescription('Check today\'s Warframe sortie missions.'),

	run: async ({ interaction }) => {
		await interaction.deferReply();

		const sortie = await getWarframeSortie();

		if (sortie) {
			const sortieMessage = sortie.variants.map(mission => `${mission.missionType} on ${mission.node}`).join('\n');
			await interaction.editReply(`Today's Sortie Missions:\n${sortieMessage}`);
		} else {
			await interaction.editReply('No sortie is currently active.');
		}
	},
	options: {
		cooldown: '1m',
	},
};
