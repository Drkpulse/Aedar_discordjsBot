const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('slots')
		.setDescription('Jogue nas slots!')
		.addIntegerOption(option =>
			option.setName('bet')
				.setDescription('Quantia a ser apostada')
				.setRequired(true)
		),

	run: async ({ interaction }) => {
		await interaction.deferReply({ fetchReply: true });

		// Define the symbols for the slots
		const symbols = ['🍒', '🍋', '🍊', '🍉', '🍇', '🔔', '⭐', '💰'];

		// Get the bet amount from the user
		const betAmount = interaction.options.getInteger('bet');

		// Check if the bet amount is valid (greater than 0)
		if (betAmount <= 0) {
			return await interaction.editReply('❌ Aposta inválida! Por favor, aposte um valor maior que 0.');
		}

		// Show initial spinning message
		await interaction.editReply(`🎰 As slots estão girando...`);

		// Number of spins for each symbol
		const spins = 10;
		const delay = 200; // Delay for each spin
		let finalResults = [];

		// Generate initial random symbols for the final result
		for (let i = 0; i < 3; i++) {
			finalResults.push(symbols[Math.floor(Math.random() * symbols.length)]);
		}

		// Function to simulate spinning for a specific symbol
		const spinSymbol = async (index, spinCount) => {
			for (let spin = 0; spin < spinCount; spin++) {
				await new Promise(resolve => setTimeout(resolve, delay));
				const currentResults = finalResults.map((symbol, i) => {
					return i === index ? symbols[Math.floor(Math.random() * symbols.length)] : symbol;
				});
				await interaction.editReply(`🎰 As slots estão girando... ${currentResults.join(' | ')}`);
			}
			// After spinning, set the final symbol for this index
			finalResults[index] = symbols[Math.floor(Math.random() * symbols.length)];
		};

		// Spin all symbols sequentially
		for (let i = 0; i < 3; i++) {
			await spinSymbol(i, spins); // Spin the i-th symbol
			await new Promise(resolve => setTimeout(resolve, delay)); // Wait a bit before stopping the next symbol
		}

		// Finalize the display for all symbols
		const resultMessage = finalResults.join(' | ');

		// Check the results
		const symbolCount = {};
		finalResults.forEach(symbol => {
			symbolCount[symbol] = (symbolCount[symbol] || 0) + 1;
		});

		const uniqueSymbols = Object.keys(symbolCount).length;
		let payout = 0;

		// Determine the outcome based on the number of unique symbols
		if (uniqueSymbols === 3) {
			// All different symbols
			await interaction.editReply(`😢 Você perdeu! Resultado: **${resultMessage}** (Perdeu ${betAmount} moedas!)`);
		} else if (uniqueSymbols === 2) {
			// Two of the same symbol
			payout = betAmount; // Return the bet amount
			await interaction.editReply(`💵 Você recebeu seu dinheiro de volta! Resultado: **${resultMessage}** (Você ganhou ${payout} moedas!)`);
		} else {
			// Three of the same symbol (jackpot)
			payout = betAmount * 3; // Triple the bet amount
			await interaction.editReply(`🎉 Você ganhou! Jackpot! Resultado: **${resultMessage}** (Você ganhou ${payout} moedas!)`);
		}
	},
	options: {
		cooldown: '2s',
	},
};
