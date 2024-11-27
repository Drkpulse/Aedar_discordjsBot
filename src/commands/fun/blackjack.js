const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

const deck = [
	'2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'
];

const getCardValue = (card) => {
	if (['J', 'Q', 'K'].includes(card)) return 10;
	if (card === 'A') return 11; // Ace can be 11 or 1, handled later
	return parseInt(card);
};

const calculateScore = (hand) => {
	let score = hand.reduce((total, card) => total + getCardValue(card), 0);
	let aces = hand.filter(card => card === 'A').length;

	// Adjust for Aces
	while (score > 21 && aces) {
		score -= 10;
		aces--;
	}

	return score;
};

const drawCard = (deck) => {
	const randomIndex = Math.floor(Math.random() * deck.length);
	return deck.splice(randomIndex, 1)[0];
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('blackjack')
		.setDescription('Jogue uma partida de Blackjack!'),

	run: async ({ interaction }) => {
		const playerHand = [drawCard(deck), drawCard(deck)];
		const dealerHand = [drawCard(deck), drawCard(deck)];

		const playerScore = calculateScore(playerHand);
		const dealerScore = calculateScore(dealerHand);

		let gameMessage = `**Suas cartas:** ${playerHand.join(', ')} (Total: ${playerScore})\n`;
		gameMessage += `**Cartas do dealer:** ${dealerHand[0]}, ?\n`;

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('hit')
					.setLabel('Pedir Carta')
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('stand')
					.setLabel('Parar')
					.setStyle('SECONDARY')
			);

		const reply = await interaction.reply({ content: gameMessage, components: [row], fetchReply: true });

		const filter = (buttonInteraction) => {
			return buttonInteraction.user.id === interaction.user.id;
		};

		const collector = reply.createMessageComponentCollector({ filter, time: 30000 });

		collector.on('collect', async (buttonInteraction) => {
			if (buttonInteraction.customId === 'hit') {
				playerHand.push(drawCard(deck));
				const newPlayerScore = calculateScore(playerHand);

				if (newPlayerScore > 21) {
					await buttonInteraction.update({ content: `**Suas cartas:** ${playerHand.join(', ')} (Total: ${newPlayerScore})\nVocê estourou! O dealer ganha.`, components: [] });
					collector.stop();
				} else {
					await buttonInteraction.update({ content: `**Suas cartas:** ${playerHand.join(', ')} (Total: ${newPlayerScore})\n**Cartas do dealer:** ${dealerHand[0]}, ?`, components: [row] });
				}
			} else if (buttonInteraction.customId === 'stand') {
				let dealerScore = calculateScore(dealerHand);
				while (dealerScore < 17) {
					dealerHand.push(drawCard(deck));
					dealerScore = calculateScore(dealerHand);
				}

				let resultMessage = `**Suas cartas:** ${playerHand.join(', ')} (Total: ${calculateScore(playerHand)})\n`;
				resultMessage += `**Cartas do dealer:** ${dealerHand.join(', ')} (Total: ${dealerScore})\n`;

				if (dealerScore > 21 || calculateScore(playerHand) > dealerScore) {
					resultMessage += 'Você ganhou!';
				} else if (calculateScore(playerHand) < dealerScore) {
					resultMessage += 'O dealer ganhou!';
				} else {
					resultMessage += 'É um empate!';
				}

				await buttonInteraction.update({ content: resultMessage, components: [] });
				collector.stop();
			}
		});

		collector.on('end', () => {
			if (!collector.ended) {
				interaction.followUp({ content: 'O tempo para jogar acabou!', ephemeral: true });
			}
		});
	},
};