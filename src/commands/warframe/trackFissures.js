const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getVoidFissures } = require('../../helpers/warframeapi.js');

// Tier emojis and colors
const tierInfo = {
	'Lith': { emoji: '🥉', color: '#CD7F32' },  // Bronze
	'Meso': { emoji: '🥈', color: '#C0C0C0' },  // Silver
	'Neo': { emoji: '🥇', color: '#FFD700' },   // Gold
	'Axi': { emoji: '💎', color: '#00FFFF' },   // Diamond
	'Requiem': { emoji: '🔮', color: '#800080' } // Purple
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('trackfissures')
		.setDescription('Check the current Warframe Void Fissures.'),

	run: async ({ interaction }) => {
		await interaction.deferReply();

		const fissures = await getVoidFissures();

		if (fissures.length > 0) {
			// Group fissures by tier
			const fissuresByTier = {
				'Lith': [],
				'Meso': [],
				'Neo': [],
				'Axi': [],
				'Requiem': []
			};

			fissures.forEach(fissure => {
				if (fissuresByTier.hasOwnProperty(fissure.tier)) {
					fissuresByTier[fissure.tier].push(fissure);
				}
			});

			// Create initial embed showing all tiers
			const embed = new EmbedBuilder()
				.setTitle('Current Void Fissures')
				.setColor('#7b68ee')
				.setDescription('Select a tier button below to view specific fissures')
				.setTimestamp()
				.setFooter({ text: 'Data provided by Warframe API' });

			// Add summary counts for each tier
			Object.entries(fissuresByTier).forEach(([tier, tierFissures]) => {
				if (tierFissures.length > 0) {
					embed.addFields({
						name: `${tierInfo[tier].emoji} ${tier} Fissures`,
						value: `${tierFissures.length} available`,
						inline: true
					});
				}
			});

			// Create buttons for each tier
			const row = new ActionRowBuilder();

			Object.entries(fissuresByTier).forEach(([tier, tierFissures]) => {
				if (tierFissures.length > 0) {
					row.addComponents(
						new ButtonBuilder()
							.setCustomId(`fissure_${tier.toLowerCase()}`)
							.setLabel(`${tier} (${tierFissures.length})`)
							.setEmoji(tierInfo[tier].emoji)
							.setStyle(ButtonStyle.Primary)
					);
				}
			});

			const message = await interaction.editReply({
				embeds: [embed],
				components: [row]
			});

			// Create a collector for button interactions
			const collector = message.createMessageComponentCollector({
				time: 60000 // Collector active for 1 minute
			});

			collector.on('collect', async i => {
				if (i.user.id === interaction.user.id) {
					// Get the selected tier from the button ID
					const tierSelected = i.customId.split('_')[1];
					const tierName = Object.keys(fissuresByTier).find(t => t.toLowerCase() === tierSelected);

					if (tierName) {
						const tierEmbed = new EmbedBuilder()
							.setTitle(`${tierInfo[tierName].emoji} ${tierName} Void Fissures`)
							.setColor(tierInfo[tierName].color)
							.setTimestamp()
							.setFooter({ text: 'Data provided by Warframe API' });

						const tierFissures = fissuresByTier[tierName];

						if (tierFissures.length > 0) {
							const fieldValue = tierFissures.map(fissure => {
								const timeLeft = new Date(fissure.expiry) - new Date();
								const minutesLeft = Math.floor(timeLeft / 60000);
								return `• **${fissure.missionType}** on **${fissure.node}** (${minutesLeft}m)`;
							}).join('\n');

							tierEmbed.setDescription(fieldValue);
						} else {
							tierEmbed.setDescription('No fissures available for this tier.');
						}

						await i.update({ embeds: [tierEmbed], components: [row] });
					}
				} else {
					await i.reply({
						content: 'These buttons are not for you!',
						ephemeral: true
					});
				}
			});

			collector.on('end', async () => {
				// Disable all buttons when the collector ends
				const disabledRow = new ActionRowBuilder();
				row.components.forEach(button => {
					disabledRow.addComponents(
						ButtonBuilder.from(button).setDisabled(true)
					);
				});

				await message.edit({ components: [disabledRow] }).catch(() => {});
			});
		} else {
			await interaction.editReply('There are no active Void Fissures.');
		}
	},
	options: {
		cooldown: '1m',
	},
};
