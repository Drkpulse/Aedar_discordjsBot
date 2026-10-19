import { SlashCommandBuilder } from 'discord.js';
import { placeBet, payOut } from '../../../utils/casino.js';

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

const colorOf = (number) => {
	if (number === 0) return 'verde';
	return RED_NUMBERS.has(number) ? 'vermelho' : 'preto';
};

// Total returned to the player (bet included), as in European roulette.
const NUMBER_MULTIPLIER = 36;
const EVEN_MONEY_MULTIPLIER = 2;

export const command = new SlashCommandBuilder()
	.setName('roulette')
	.setDescription('Jogue na roleta! Aposte em um número, cor ou par/ímpar.')
	.addStringOption((option) =>
		option.setName('bet')
			.setDescription('Aposte em um número (0-36), "vermelho", "preto", "par" ou "impar"')
			.setRequired(true)
	)
	.addIntegerOption((option) =>
		option.setName('amount')
			.setDescription('Quantidade de moedas para apostar')
			.setMinValue(1)
			.setRequired(true)
	).toJSON();

/** Turns the player's text into a bet, or null when it isn't valid. */
function parseBet(text) {
	const value = text.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
	if (/^\d{1,2}$/.test(value)) {
		const number = Number(value);
		return number <= 36 ? { type: 'number', number } : null;
	}
	if (['vermelho', 'preto', 'par', 'impar'].includes(value)) return { type: value };
	return null;
}

/** Returns the total payout (bet included) for a bet and the winning number. */
function payoutFor(bet, amount, winningNumber) {
	switch (bet.type) {
		case 'number':
			return bet.number === winningNumber ? amount * NUMBER_MULTIPLIER : 0;
		case 'vermelho':
		case 'preto':
			return colorOf(winningNumber) === bet.type ? amount * EVEN_MONEY_MULTIPLIER : 0;
		case 'par':
			return winningNumber !== 0 && winningNumber % 2 === 0 ? amount * EVEN_MONEY_MULTIPLIER : 0;
		case 'impar':
			return winningNumber % 2 === 1 ? amount * EVEN_MONEY_MULTIPLIER : 0;
		default:
			return 0;
	}
}

export const chatInput = async ({ interaction }) => {
	const bet = parseBet(interaction.options.getString('bet'));
	const amount = interaction.options.getInteger('amount');
	const userId = interaction.user.id;

	await interaction.deferReply();

	try {
		if (!bet) {
			return interaction.editReply('❌ Aposta inválida! Use um número de 0 a 36, "vermelho", "preto", "par" ou "impar".');
		}

		const placed = await placeBet(userId, amount);
		if (!placed.ok) return interaction.editReply(placed.message);

		const winningNumber = Math.floor(Math.random() * 37);
		const winnings = payoutFor(bet, amount, winningNumber);
		const balance = winnings > 0 ? await payOut(userId, winnings) : placed.balance;

		let message = `🎡 A roleta parou em **${winningNumber}** (${colorOf(winningNumber)})!`;
		message += winnings > 0
			? ` 🎉 Você ganhou **${winnings}** moedas!`
			: ` 😢 Você perdeu **${amount}** moedas.`;

		await interaction.editReply(`${message}\nSaldo: **${balance}** moedas.`);
	} catch (error) {
		console.error('Erro na roleta:', error);
		await interaction.editReply('Ocorreu um erro ao processar sua aposta. Tente novamente mais tarde.').catch(() => {});
	}
};

export const options = {
	cooldown: '3s',
};
