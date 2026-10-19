import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getWarframeDrops } from '../../../helpers/warframeapi.js';

export const command = new SlashCommandBuilder()
	.setName('drops')
	.setDescription('Look up where items drop in Warframe and their drop chances')
	.addStringOption(option =>
		option.setName('item')
			.setDescription('The item to look up (e.g., "Neuroptics", "Relic", "Continuity")')
			.setRequired(true)
			.setMaxLength(100)).toJSON();

export const chatInput = async ({ interaction }) => {
	await interaction.deferReply();

	const searchTerm = interaction.options.getString('item');
	const drops = await getWarframeDrops(searchTerm);

	if (!drops || drops.length === 0) {
		return interaction.editReply(`No drop data found for "${searchTerm}". Try using a more general search term.`);
	}

	// Create embed
	const embed = new EmbedBuilder()
		.setTitle(`Warframe Drop Data: ${searchTerm}`)
		.setColor('#FFD700')
		.setTimestamp()
		.setFooter({ text: 'Data provided by Warframe API' });

	// Group drops by category for better organization
	const categories = {};

	drops.forEach(drop => {
		// Create category if it doesn't exist
		if (!categories[drop.category]) {
			categories[drop.category] = [];
		}

		// Add drop to category
		categories[drop.category].push(drop);
	});

	// Add each category to the embed
	for (const [category, categoryDrops] of Object.entries(categories)) {
		// Limit to first 5 drops per category to avoid hitting Discord embed limits
		const displayDrops = categoryDrops.slice(0, 5);

		let fieldValue = displayDrops.map(drop => {
			// Fix the drop chance percentage calculation
			const chanceDisplay = `${(drop.chance * 100).toFixed(2)}%`;

			return `**${drop.item}**\n` +
				`Location: ${drop.location}\n` +
				`Chance: ${chanceDisplay}\n`;
		}).join('\n');

		// Add note if there are more drops
		if (categoryDrops.length > 5) {
			fieldValue += `\n*...and ${categoryDrops.length - 5} more locations*`;
		}

		embed.addFields({
			name: `📦 ${category}`,
			value: fieldValue,
			inline: false
		});
	}

	// If there are too many categories, add a note
	if (Object.keys(categories).length > 5) {
		embed.setDescription(`Showing the top results for "${searchTerm}". Please use a more specific search term for better results.`);
	}

	await interaction.editReply({ embeds: [embed] });
};

export const options = {
	cooldown: '15s',
};
