const { SlashCommandBuilder } = require('discord.js');
const { getWarframeInvasions } = require('../../helpers/warframeapi.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('checkinvasions')
		.setDescription('Check the current Warframe invasions.'),

	run: async ({ interaction }) => {
		await interaction.deferReply();

		const invasions = await getWarframeInvasions();

		if (invasions.length > 0) {
			const invasionMessage = invasions.map(invasion => `${invasion.attacker.faction} vs ${invasion.defender.faction} on ${invasion.node}: ${invasion.attackerReward.asString || 'No reward'}`).join('\n');
			await interaction.editReply(`Current Invasions:\n${invasionMessage}`);
		} else {
			await interaction.editReply('There are no active invasions at the moment.');
		}
	},
	options: {
		cooldown: '1m',
	},
};
