const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hilo')
		.setDescription('Jogue Hi-Lo! Tente adivinhar se a próxima carta é maior ou menor!'),

	run: async ({ interaction, client, handler }) => {
		await interaction.deferReply({ fetchReply: true });

		// Function to generate a random card value (1-13)
		const getRandomCard = () => Math.floor(Math.random() * 13) + 1;

		// Start the game with an initial card
		let currentCard = getRandomCard();
		let score = 0;

		const playGame = async () => {
			// Show the current card
			await interaction.editReply(`🃏 A carta atual é **${currentCard}**. Você tem **${score}** pontos.\n\nAdivinhe se a próxima carta será **maior** ou **menor**! (responda com "maior" ou "menor")`);

			// Wait for the user's response
			const filter = response => {
				return response.author.id === interaction.user.id && (response.content.toLowerCase() === 'maior' || response.content.toLowerCase() === 'menor');
			};

			const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] }).catch(() => {
				interaction.followUp('⏰ Tempo esgotado! O jogo terminou.');
			});

			if (!collected) return;

			const userGuess = collected.first().content.toLowerCase();
			const nextCard = getRandomCard();

			// Determine if the guess was correct
			const isHigher = nextCard > currentCard;
			const resultMessage = `A próxima carta é **${nextCard}**.`;

			if ((userGuess === 'maior' && isHigher) || (userGuess === 'menor' && !isHigher)) {
				score++;
				await interaction.followUp(`${resultMessage} 🎉 Você acertou! Pontos: **${score}**`);
				currentCard = nextCard; // Update the current card
				playGame(); // Continue the game
			} else {
				await interaction.followUp(`${resultMessage} 😢 Você errou! Pontos finais: **${score}**`);
			}
		};

		playGame(); // Start the game
	},
	options: {
		cooldown: '2s',
	},
};
