const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getWarframeProfile } = require('../../helpers/warframeapi.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('View a Warframe player\'s profile')
		.addStringOption(option =>
			option.setName('username')
				.setDescription('The Warframe username to look up')
				.setRequired(true)),

	run: async ({ interaction }) => {
		await interaction.deferReply();

		const username = interaction.options.getString('username');
		const profile = await getWarframeProfile(username);

		if (!profile) {
			return interaction.editReply(`Could not find profile for user: ${username}. Make sure the username is correct and the profile is public.`);
		}

		// Create embed
		const embed = new EmbedBuilder()
			.setTitle(`Warframe Profile: ${profile.name}`)
			.setColor('#7B68EE')
			.setTimestamp()
			.setFooter({ text: 'Data provided by Warframe API' });

		// Add basic profile info
		embed.addFields(
			{ name: '⭐ Mastery Rank', value: `${profile.masteryRank || 'Unknown'}`, inline: true },
			{ name: '🏆 Mastery Score', value: `${profile.masteryScore ? profile.masteryScore.toLocaleString() : 'Unknown'}`, inline: true },
			{ name: '👤 Status', value: profile.lastSeen ? `Last seen: ${profile.lastSeen}` : 'Unknown', inline: true }
		);

		// Add equipment info if available
		if (profile.equipment && profile.equipment.length > 0) {
			// Get current loadout
			const currentLoadout = profile.equipment.find(eq => eq.current);
			if (currentLoadout) {
				let loadoutText = '';

				if (currentLoadout.warframe) {
					loadoutText += `**Warframe**: ${currentLoadout.warframe}\n`;
				}

				if (currentLoadout.primary) {
					loadoutText += `**Primary**: ${currentLoadout.primary}\n`;
				}

				if (currentLoadout.secondary) {
					loadoutText += `**Secondary**: ${currentLoadout.secondary}\n`;
				}

				if (currentLoadout.melee) {
					loadoutText += `**Melee**: ${currentLoadout.melee}\n`;
				}

				if (loadoutText) {
					embed.addFields({ name: '🔫 Current Loadout', value: loadoutText, inline: false });
				}
			}
		}

		// Add stats if available
		if (profile.stats) {
			let statsText = '';

			if (profile.stats.timePlayed) {
				statsText += `**Time Played**: ${profile.stats.timePlayed} hours\n`;
			}

			if (profile.stats.questsCompleted) {
				statsText += `**Quests Completed**: ${profile.stats.questsCompleted}\n`;
			}

			if (profile.stats.enemiesKilled) {
				statsText += `**Enemies Killed**: ${profile.stats.enemiesKilled.toLocaleString()}\n`;
			}

			if (profile.stats.missionCompleted) {
				statsText += `**Missions Completed**: ${profile.stats.missionCompleted.toLocaleString()}\n`;
			}

			if (statsText) {
				embed.addFields({ name: '📊 Stats', value: statsText, inline: false });
			}
		}

		// Add clan info if available
		if (profile.clan) {
			embed.addFields({
				name: '🏛️ Clan',
				value: `**Name**: ${profile.clan.name}\n**Rank**: ${profile.clan.rank || 'Unknown'}\n**Role**: ${profile.clan.role || 'Member'}`,
				inline: false
			});
		}

		// Add note about public profiles
		embed.setDescription('Note: Only public information is displayed. Players can adjust their privacy settings in-game.');

		await interaction.editReply({ embeds: [embed] });
	},
	options: {
		cooldown: '30s',
	},
};
