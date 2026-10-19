import { SlashCommandBuilder } from 'discord.js';
import { placeBet, payOut } from '../../../utils/casino.js';

const SYMBOLS = ['🍒', '🍋', '🍊', '🍉', '🍇', '🔔', '⭐', '💰'];

// Total returned to the player (bet included) for each result.
const PAIR_MULTIPLIER = 2;
const JACKPOT_MULTIPLIER = 10;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

export const command = new SlashCommandBuilder()
	.setName('slots')
	.setDescription('Jogue nas slots!')
	.addIntegerOption((option) =>
		option.setName('bet')
			.setDescription('Quantia a ser apostada')
			.setMinValue(1)
			.setRequired(true)
	).toJSON();

export const chatInput = async ({ interaction }) => {
	const bet = interaction.options.getInteger('bet');
	const userId = interaction.user.id;

	await interaction.deferReply();

	try {
		const placed = await placeBet(userId, bet);
		if (!placed.ok) return interaction.editReply(placed.message);

		const reels = [randomSymbol(), randomSymbol(), randomSymbol()];

		const result = reels.join(' | ');
		const uniqueSymbols = new Set(reels).size;

		let winnings = 0;
		let message;
		if (uniqueSymbols === 1) {
			winnings = bet * JACKPOT_MULTIPLIER;
			message = `🎉 JACKPOT! Resultado: **${result}**. Você ganhou **${winnings}** moedas!`;
		} else if (uniqueSymbols === 2) {
			winnings = bet * PAIR_MULTIPLIER;
			message = `💵 Dois iguais! Resultado: **${result}**. Você ganhou **${winnings}** moedas!`;
		} else {
			message = `😢 Você perdeu! Resultado: **${result}**. Perdeu **${bet}** moedas.`;
		}

		// Settle the bet before the animation, so a failed message edit can't cost the player their winnings
		const balance = winnings > 0 ? await payOut(userId, winnings) : placed.balance;

		// Reveal the reels one at a time (few edits, to stay clear of Discord's rate limits)
		await interaction.editReply(`🎰 As slots estão girando... ❔ | ❔ | ❔`);
		for (let i = 1; i <= reels.length; i++) {
			await sleep(700);
			const shown = reels.map((symbol, index) => (index < i ? symbol : '❔'));
			await interaction.editReply(`🎰 As slots estão girando... ${shown.join(' | ')}`);
		}

		await interaction.editReply(`${message}\nSaldo: **${balance}** moedas.`);
	} catch (error) {
		console.error('Erro nas slots:', error);
		await interaction.editReply('Ocorreu um erro ao processar sua aposta. Tente novamente mais tarde.').catch(() => {});
	}
};

export const options = {
	cooldown: '5s',
};
