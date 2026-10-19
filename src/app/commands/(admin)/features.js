import {
	SlashCommandBuilder,
	PermissionFlagsBits,
	InteractionContextType,
	EmbedBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
	ComponentType,
} from 'discord.js';
import { getLoadedCommands } from '../../../helpers/commandRegistry.js';
import {
	AUTOMATIC_FEATURES,
	CORE_CATEGORIES,
	autoKey,
	categoryKey,
	getCategoryInfo,
	isFeatureEnabled,
	setFeatures,
} from '../../../helpers/featureManager.js';

// /features opens a menu where server admins turn whole parts of the bot on or off:
// every command category, plus the automatic features that run from events.
// Single commands can still be switched with /toggle.

const MENU_TIMEOUT = 10 * 60 * 1000;

export const command = new SlashCommandBuilder()
	.setName('features')
	.setDescription('Turn bot features on or off for this server')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setContexts(InteractionContextType.Guild)
	.toJSON();

export const chatInput = async ({ interaction, commandkit }) => {
	if (!interaction.inGuild()) {
		return interaction.reply({ content: 'This command only works in a server.', flags: MessageFlags.Ephemeral });
	}

	const guildId = interaction.guildId;
	const categories = getToggleableCategories(commandkit);
	const ids = {
		categories: `features-categories-${interaction.id}`,
		automatic: `features-automatic-${interaction.id}`,
		enableAll: `features-enable-${interaction.id}`,
		disableAll: `features-disable-${interaction.id}`,
		close: `features-close-${interaction.id}`,
	};

	const render = (note = null) => ({
		embeds: [buildEmbed(categories, guildId, note)],
		components: buildComponents(categories, guildId, ids),
	});

	const response = await interaction.reply({ ...render(), flags: MessageFlags.Ephemeral, withResponse: true });
	const message = response.resource?.message;
	if (!message) return;

	const collector = message.createMessageComponentCollector({
		filter: (i) => i.user.id === interaction.user.id && Object.values(ids).includes(i.customId),
		time: MENU_TIMEOUT,
	});

	collector.on('collect', async (i) => {
		if (i.customId === ids.close) {
			collector.stop('closed');
			return i.update({ ...render('Menu closed. Run /features again to make more changes.'), components: [] });
		}

		await i.deferUpdate();

		// Work out which switches change
		const allKeys = [
			...categories.map(categoryKey),
			...Object.keys(AUTOMATIC_FEATURES).map(autoKey),
		];
		let wanted;
		if (i.customId === ids.enableAll) {
			wanted = Object.fromEntries(allKeys.map((key) => [key, true]));
		} else if (i.customId === ids.disableAll) {
			wanted = Object.fromEntries(allKeys.map((key) => [key, false]));
		} else if (i.componentType === ComponentType.StringSelect) {
			// The menu holds every option of its group; the selected ones are the ones turned on
			const group = i.customId === ids.categories
				? categories.map(categoryKey)
				: Object.keys(AUTOMATIC_FEATURES).map(autoKey);
			wanted = Object.fromEntries(group.map((key) => [key, i.values.includes(key)]));
		}

		const changes = Object.fromEntries(
			Object.entries(wanted ?? {}).filter(([key, enabled]) => isFeatureEnabled(key, guildId) !== enabled),
		);

		try {
			await setFeatures(guildId, changes, i.user.id);
			const count = Object.keys(changes).length;
			const note = count === 0 ? 'Nothing changed.' : `Saved ${count} change${count === 1 ? '' : 's'}.`;
			await i.editReply(render(`✅ ${note}`));
		} catch (error) {
			console.error('Error saving feature settings:', error);
			await i.editReply(render('❌ Could not save the changes. Check the database connection and try again.'));
		}
	});

	collector.on('end', async (_, reason) => {
		if (reason === 'closed') return;
		await interaction.editReply({ components: [] }).catch(() => {});
	});
};

export const options = {
	cooldown: '5s',
	isActive: true,
	isAdmin: true,
};

// Command categories that have commands loaded and can be switched off
function getToggleableCategories(commandkit) {
	const categories = new Set();
	for (const cmd of getLoadedCommands(commandkit)) {
		const category = cmd.category?.toLowerCase();
		if (category && !CORE_CATEGORIES.includes(category)) categories.add(category);
	}
	// A select menu holds at most 25 options
	return [...categories].sort().slice(0, 25);
}

function statusLine(enabled, emoji, label) {
	return `${enabled ? '🟢' : '🔴'} ${emoji} ${label}`;
}

function buildEmbed(categories, guildId, note) {
	const categoryLines = categories.map((category) => {
		const info = getCategoryInfo(category);
		return statusLine(isFeatureEnabled(categoryKey(category), guildId), info.emoji, info.label);
	});
	const automaticLines = Object.entries(AUTOMATIC_FEATURES).map(([name, info]) =>
		statusLine(isFeatureEnabled(autoKey(name), guildId), info.emoji, info.label),
	);

	const embed = new EmbedBuilder()
		.setTitle('⚙️ Bot features')
		.setColor('#0099ff')
		.setDescription(
			'Pick which features are on in this server. Selected items are on, unselected items are off.\n' +
			'Admin commands are always on so this menu stays reachable.',
		)
		.addFields(
			{ name: 'Command categories', value: categoryLines.join('\n') || 'No categories found', inline: true },
			{ name: 'Automatic features', value: automaticLines.join('\n'), inline: true },
		)
		.setFooter({ text: 'Use /toggle to switch a single command, and /commands to see every command.' })
		.setTimestamp();

	if (note) embed.addFields({ name: '​', value: note });
	return embed;
}

function buildComponents(categories, guildId, ids) {
	const rows = [];

	if (categories.length > 0) {
		rows.push(new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId(ids.categories)
				.setPlaceholder('Command categories that are on')
				.setMinValues(0)
				.setMaxValues(categories.length)
				.addOptions(categories.map((category) => {
					const info = getCategoryInfo(category);
					return {
						label: info.label,
						description: info.description.slice(0, 100),
						emoji: info.emoji,
						value: categoryKey(category),
						default: isFeatureEnabled(categoryKey(category), guildId),
					};
				})),
		));
	}

	const automatic = Object.entries(AUTOMATIC_FEATURES);
	rows.push(new ActionRowBuilder().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId(ids.automatic)
			.setPlaceholder('Automatic features that are on')
			.setMinValues(0)
			.setMaxValues(automatic.length)
			.addOptions(automatic.map(([name, info]) => ({
				label: info.label,
				description: info.description.slice(0, 100),
				emoji: info.emoji,
				value: autoKey(name),
				default: isFeatureEnabled(autoKey(name), guildId),
			}))),
	));

	rows.push(new ActionRowBuilder().addComponents(
		new ButtonBuilder().setCustomId(ids.enableAll).setLabel('Turn all on').setStyle(ButtonStyle.Success),
		new ButtonBuilder().setCustomId(ids.disableAll).setLabel('Turn all off').setStyle(ButtonStyle.Danger),
		new ButtonBuilder().setCustomId(ids.close).setLabel('Done').setStyle(ButtonStyle.Secondary),
	));

	return rows;
}
