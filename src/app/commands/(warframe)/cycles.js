import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getWarframeCycles } from '../../../helpers/warframeapi.js';

export const command = new SlashCommandBuilder()
	.setName('cycles')
	.setDescription('Check the current Warframe open world cycles.').toJSON();

export const chatInput = async ({ interaction }) => {
	await interaction.deferReply();

	const cyclesData = await getWarframeCycles();

	if (cyclesData) {
		// Create embed
		const embed = new EmbedBuilder()
			.setTitle('Warframe Open World Cycles')
			.setColor('#00BFFF')
			.setTimestamp()
			.setFooter({ text: 'Data provided by Warframe API' });

		// Earth/Cetus cycle
		if (cyclesData.earthCycle) {
			const { isDay, timeLeft } = cyclesData.earthCycle;
			const minutes = Math.floor(timeLeft / 60);
			const seconds = timeLeft % 60;

			embed.addFields({
				name: '🌍 Earth/Cetus',
				value: `**Current State**: ${isDay ? '☀️ Day' : '🌙 Night'}\n` +
					`**Time Remaining**: ${minutes}m ${seconds}s`,
				inline: true
			});
		}

		// Fortuna/Orb Vallis cycle
		if (cyclesData.vallisCycle) {
			const { isWarm, timeLeft } = cyclesData.vallisCycle;
			const minutes = Math.floor(timeLeft / 60);
			const seconds = timeLeft % 60;

			embed.addFields({
				name: '❄️ Fortuna/Orb Vallis',
				value: `**Current State**: ${isWarm ? '🔥 Warm' : '❄️ Cold'}\n` +
					`**Time Remaining**: ${minutes}m ${seconds}s`,
				inline: true
			});
		}

		// Cambion Drift cycle
		if (cyclesData.cambionCycle) {
			const { state, timeLeft } = cyclesData.cambionCycle;
			const minutes = Math.floor(timeLeft / 60);
			const seconds = timeLeft % 60;

			embed.addFields({
				name: '👹 Cambion Drift',
				value: `**Current State**: ${state === 'fass' ? '🔴 Fass' : '🔵 Vome'}\n` +
					`**Time Remaining**: ${minutes}m ${seconds}s`,
				inline: true
			});
		}

		// Zariman cycle
		if (cyclesData.zarimanCycle) {
			const { state, timeLeft } = cyclesData.zarimanCycle;
			const minutes = Math.floor(timeLeft / 60);
			const seconds = timeLeft % 60;

			embed.addFields({
				name: '🚀 Zariman',
				value: `**Current State**: ${state}\n` +
					`**Time Remaining**: ${minutes}m ${seconds}s`,
				inline: true
			});
		}

		await interaction.editReply({ embeds: [embed] });
	} else {
		await interaction.editReply('Failed to fetch cycle data. Please try again later.');
	}
};

export const options = {
	cooldown: '1m',
};
