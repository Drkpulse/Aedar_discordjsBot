const { SlashCommandBuilder } = require('discord.js');
const { getWarframeAlerts } = require('../../helpers/warframeapi.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('checkalerts')
		.setDescription('Check the current Warframe alerts.'),

	run: async ({ interaction }) => {
		await interaction.deferReply();

		const alerts = await getWarframeAlerts();

		if (alerts.length > 0) {
			const alertMessage = alerts.map(alert => `${alert.mission.type} on ${alert.mission.node}: ${alert.reward.asString}`).join('\n');
			await interaction.editReply(`Current Alerts:\n${alertMessage}`);
		} else {
			await interaction.editReply('There are no active alerts at the moment.');
		}
	},
	options: {
		cooldown: '1m',
	},
};
