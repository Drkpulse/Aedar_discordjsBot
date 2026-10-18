import { stopMiddlewares } from 'commandkit';
import { Collection, MessageFlags } from 'discord.js';
import { isCommandActive } from '../../helpers/commandManager.js';
import { DEV_USER_IDS } from '../../helpers/devConfig.js';

// Runs before every command. Replaces the old src/validations folder (active.js and cooldowns.js).
// Applies to slash commands and context menu commands. Each command can export `options` with: isActive, devOnly, cooldown.
// User and bot permissions are checked by CommandKit itself, from each command's `metadata`.

const cooldowns = new Collection();

const inactiveMessages = [
	'Este comando está atualmente desativado. Tente novamente mais tarde!',
	'Desculpe, mas este comando não está disponível no momento.',
	'Este comando está em manutenção. Por favor, aguarde!',
	'Oops! Este comando foi colocado em modo de espera.',
	'Este comando está fora de serviço. Tente outro!',
	'Desculpe, mas o bot está a fazer algumas atualizações e este comando não está ativo.',
	'Este comando está temporariamente desativado. Volte mais tarde!',
	'Este comando está a descansar. Tente novamente mais tarde!',
];

/** @param {import('commandkit').MiddlewareContext} ctx */
export async function beforeExecute(ctx) {
	// Autocomplete suggestions should never be blocked or count towards a cooldown.
	if (ctx.isAutocomplete()) return;

	const { interaction } = ctx;
	const options = ctx.command.data.options ?? {};
	const commandName = interaction.commandName;

	// 1. Dev-only commands
	if (options.devOnly && !DEV_USER_IDS.includes(interaction.user.id)) {
		await interaction.reply({ content: 'Este comando é apenas para os developers do bot.', flags: MessageFlags.Ephemeral });
		stopMiddlewares();
	}

	// 2. Disabled commands (globally in the file, or per server with /toggle)
	if (options.isActive === false || !isCommandActive(commandName, interaction.guildId)) {
		const randomMessage = inactiveMessages[Math.floor(Math.random() * inactiveMessages.length)];
		await interaction.reply({ content: randomMessage, flags: MessageFlags.Ephemeral });
		stopMiddlewares();
	}

	// 3. Cooldowns
	if (!options.cooldown) return;

	const cooldownAmount = parseCooldown(options.cooldown);
	if (!cooldownAmount) {
		console.warn(`Invalid cooldown format for command ${commandName}: ${options.cooldown}`);
		return;
	}

	const key = `${interaction.user.id}-${commandName}`;
	const lastUsed = cooldowns.get(key);
	const now = Date.now();

	if (lastUsed && now < lastUsed + cooldownAmount) {
		const timeLeft = (lastUsed + cooldownAmount - now) / 1000;
		await interaction.reply({
			content: `Por favor aguarde ${formatCooldownTime(timeLeft)} antes de usar \`/${commandName}\` novamente.`,
			flags: MessageFlags.Ephemeral,
		});
		stopMiddlewares();
	}

	cooldowns.set(key, now);
	setTimeout(() => cooldowns.delete(key), cooldownAmount);
}

// Parses a cooldown string like "30s", "5m" or "1h" into milliseconds.
function parseCooldown(cooldownStr) {
	if (!cooldownStr || typeof cooldownStr !== 'string') return null;

	const match = cooldownStr.match(/^(\d+)(ms|s|m|h|d)$/);
	if (!match) return null;

	const amount = parseInt(match[1]);
	switch (match[2]) {
		case 'ms': return amount;
		case 's': return amount * 1000;
		case 'm': return amount * 60 * 1000;
		case 'h': return amount * 60 * 60 * 1000;
		case 'd': return amount * 24 * 60 * 60 * 1000;
		default: return null;
	}
}

// Formats seconds into a human-readable string.
function formatCooldownTime(seconds) {
	if (seconds < 60) return `${Math.ceil(seconds)} segundos`;

	const minutes = Math.ceil(seconds / 60);
	return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
}
