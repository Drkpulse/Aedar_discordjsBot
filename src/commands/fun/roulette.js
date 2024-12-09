const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roulette')
		.setDescription('Jogue na roleta! Aposte em um número, cor ou par/impar.')
		.addStringOption(option =>
			option.setName('bet')
				.setDescription('Aposte em um número (0-36), "vermelho", "preto", "par" ou "impar"')
				.setRequired(true)),
	run: async ({ interaction, client, handler }) => {
		await interaction.deferReply({ fetchReply: true });

		// Get the user's bet
		const userBet = interaction.options.getString('bet').toLowerCase();

		// Define the roulette wheel
		const numbers = Array.from({ length: 37 }, (_, i) => i); // 0-36
		const colors = {
			0: 'verde',
			1: 'vermelho', 2: 'preto', 3: 'vermelho', 4: 'preto', 5: 'vermelho', 6: 'preto', 7: 'vermelho', 8: 'preto', 9: 'vermelho', 10: 'preto',
			11: 'vermelho', 12: 'preto', 13: 'vermelho', 14: 'preto', 15: 'vermelho', 16: 'preto', 17: 'vermelho', 18: 'preto', 19: 'vermelho',
			20: 'preto', 21: 'vermelho', 22: 'preto', 23: 'vermelho', 24: 'preto', 25: 'vermelho', 26: 'preto', 27: 'vermelho', 28: 'preto',
			29: 'vermelho', 30: 'preto', 31: 'vermelho', 32: 'preto', 33: 'vermelho', 34: 'preto', 35: 'vermelho', 36: 'preto'
		};

		// Spin the roulette wheel
		const winningNumber = numbers[Math.floor(Math.random() * numbers.length)];
		const winningColor = colors[winningNumber];

		// Determine if the user's bet is a win
		let resultMessage = `🎡 A roleta parou em **${winningNumber}** (${winningColor})!`;
		let win = false;

		if (userBet === winningNumber.toString()) {
			resultMessage += ` 🎉 Você ganhou apostando no número!`;
			win = true;
		} else if (userBet === 'vermelho' && winningColor === 'vermelho') {
			resultMessage += ` 🎉 Você ganhou apostando na cor vermelha!`;
			win = true;
		} else if (userBet === 'preto' && winningColor === 'preto') {
			resultMessage += ` 🎉 Você ganhou apostando na cor preta!`;
			win = true;
		} else if (userBet === 'par' && winningNumber % 2 === 0 && winningNumber !== 0) {
			resultMessage += ` 🎉 Você ganhou apostando em par!`;
			win = true;
		} else if (userBet === 'impar' && winningNumber % 2 !== 0) {
			resultMessage += ` 🎉 Você ganhou apostando em ímpar!`;
			win = true;
		} else {
			resultMessage += ` 😢 Você perdeu!`;
		}

		// Reveal the outcome
		await interaction.editReply(resultMessage);
	},
	options: {
		cooldown: '2s',
	},
};
