const { SlashCommandBuilder } = require('discord.js');
const { getVoidFissures } = require('../../helpers/warframeapi.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('trackfissures')
		.setDescription('Check the current Warframe Void Fissures.'),

	run: async ({ interaction }) => {
		await interaction.deferReply();

		const fissures = await getVoidFissures();

		if (fissures.length > 0) {
			const fissureMessage = fissures.map(fissure => `Tier: ${fissure.tier} - ${fissure.missionType} on ${fissure.node}`).join('\n');
			await interaction.editReply(`Current Void Fissures:\n${fissureMessage}`);
		} else {
			await interaction.editReply('There are no active Void Fissures.');
		}
	},
	options: {
		cooldown: '1m',
	},
};
