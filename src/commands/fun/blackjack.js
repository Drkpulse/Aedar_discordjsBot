const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

const API_URL = 'https://deckofcardsapi.com/api/deck';

let deckId;

const createDeck = async () => {
	const response = await axios.get(`${API_URL}/new/shuffle/?deck_count=1`);
	deckId = response.data.deck_id;
};

const drawCard = async () => {
	const response = await axios.get(`${API_URL}/${deckId}/draw/?count=1`);
	return response.data.cards[0]; // Return the card object
};

const getCardValue = (card) => {
	const rank = card.value;
	if (['JACK', 'QUEEN', 'KING'].includes(rank)) return 10;
	if (rank === 'ACE') return 11; // Ace can be 11 or 1, handled later
	return parseInt(rank);
};

const calculateScore = (hand) => {
	let score = hand.reduce((total, card) => total + getCardValue(card), 0);
	let aces = hand.filter(card => card.value === 'ACE').length;

	// Adjust for Aces
	while (score > 21 && aces) {
		score -= 10;
		aces--;
	}

	return score;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('blackjack')
		.setDescription('Jogue uma partida de Blackjack!'),

	run: async ({ interaction }) => {
		await createDeck(); // Create a new deck

		const playerHand = [await drawCard(), await drawCard()];
		const dealerHand = [await drawCard(), await drawCard()];

		let playerScore = calculateScore(playerHand);
		let dealerScore = calculateScore(dealerHand);

		const checkNatural = (hand, score) =>
			hand.length === 2 && score === 21;

		// Check for Natural Blackjack
		if (checkNatural(playerHand, playerScore) && checkNatural(dealerHand, dealerScore)) {
			await interaction.reply({
				content: `**Empate!** Ambos têm Blackjack!\n**Suas cartas:** ${playerHand.map(card => card.image).join(', ')}\n**Cartas do dealer:** ${dealerHand.map(card => card.image).join(', ')}`,
				ephemeral: true
			});
			return;
		} else if (checkNatural(playerHand, playerScore)) {
			await interaction.reply({
				content: `**Você ganhou com um Blackjack!**\n**Suas cartas:** ${playerHand.map(card => card.image).join(', ')}\n**Cartas do dealer:** ${dealerHand.map(card => card.image).join(', ')}`,
				ephemeral: true
			});
			return;
		} else if (checkNatural(dealerHand, dealerScore)) {
			await interaction.reply({
				content: `**O dealer ganhou com um Blackjack!**\n**Suas cartas:** ${playerHand.map(card => card.image).join(', ')}\n**Cartas do dealer:** ${dealerHand.map(card => card.image).join(', ')}`,
				ephemeral: true
			});
			return;
		}

		let gameMessage = `**Suas cartas:** ${playerHand.map(card => card.image).join(', ')} (Total: ${playerScore})\n`;
		gameMessage += `**Cartas do dealer:** ${dealerHand[0].image}, ?\n`;

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('hit')
					.setLabel('Pedir Carta')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('stand')
					.setLabel('Parar')
					.setStyle(ButtonStyle.Danger)
			);

		const reply = await interaction.reply({ content: gameMessage, components: [row], ephemeral: true, fetchReply: true });

		const filter = (buttonInteraction) => buttonInteraction.user.id === interaction.user.id;

		const collector = reply.createMessageComponentCollector({ filter, time: 30000 });

		collector.on('collect', async (buttonInteraction) => {
			if (buttonInteraction.customId === 'hit') {
				const newCard = await drawCard();
				playerHand.push(newCard);
				playerScore = calculateScore(playerHand);

				if (playerScore > 21) {
					await buttonInteraction.update({
						content: `**Suas cartas:** ${playerHand.map(card => card.image).join(', ')} (Total: ${playerScore})\nVocê estourou! O dealer ganha.`,
						components: []
					});
					collector.stop();
				} else {
					await buttonInteraction.update({
						content: `**Suas cartas:** ${playerHand.map(card => card.image).join(', ')} (Total: ${playerScore})\n**Cartas do dealer:** ${dealerHand[0].image}, ?`,
						components: [row]
					});
				}
			} else if (buttonInteraction.customId === 'stand') {
				// Dealer's turn
				while (dealerScore < 17) {
					const newCard = await drawCard();
					dealerHand.push(newCard);
					dealerScore = calculateScore(dealerHand);
				}

				let resultMessage = `**Suas cartas:** ${playerHand.map(card => card.image).join(', ')} (Total: ${playerScore})\n`;
				resultMessage += `**Cartas do dealer:** ${dealerHand.map(card => card.image).join(', ')} (Total: ${dealerScore})\n`;

				if (dealerScore > 21 || playerScore > dealerScore) {
					resultMessage += 'Você ganhou!';
				} else if (playerScore < dealerScore) {
					resultMessage += 'O dealer ganhou!';
				} else {
					resultMessage += 'É um empate!';
				}

				await buttonInteraction.update({ content: resultMessage, components: [] });
				collector.stop();
			}
		});

		collector.on('end', async (_, reason) => {
			if (reason !== 'user') {
				await interaction.followUp({ content: 'O tempo para jogar acabou!', ephemeral: true });
			}
		});
	},
};



/*
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('blackjack')
		.setDescription('Jogue uma partida de Blackjack!'),

	run: async ({ interaction }) => {
		const playerHand = [drawCard(), drawCard()];
		const dealerHand = [drawCard(), drawCard()];

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('hit')
					.setLabel('Pedir Carta')
					.setStyle(ButtonStyle.Primary), // Use ButtonStyle enum
				new ButtonBuilder()
					.setCustomId('stand')
					.setLabel('Parar')
					.setStyle(ButtonStyle.Secondary) // Use ButtonStyle enum
			);

		await interaction.reply({
			content: `**Suas cartas:** ${playerHand.join(', ')}\n**Cartas do dealer:** ${dealerHand[0]}, ?`,
			components: [row],
		});
	},
};



const createDeck = () => {
	const suits = ['♠', '♥', '♦', '♣'];
	const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
	return suits.flatMap(suit => ranks.map(rank => `${rank}${suit}`));
};

let deck = createDeck();

const getCardValue = (card) => {
	const rank = card.slice(0, -1); // Remove the suit
	if (['J', 'Q', 'K'].includes(rank)) return 10;
	if (rank === 'A') return 11; // Ace can be 11 or 1, handled later
	return parseInt(rank);
};

const calculateScore = (hand) => {
	let score = hand.reduce((total, card) => total + getCardValue(card), 0);
	let aces = hand.filter(card => card.startsWith('A')).length;

	// Adjust for Aces
	while (score > 21 && aces) {
		score -= 10;
		aces--;
	}

	return score;
};

const drawCard = () => {
	if (deck.length === 0) deck = createDeck(); // Reshuffle if deck is empty
	const randomIndex = Math.floor(Math.random() * deck.length);
	return deck.splice(randomIndex, 1)[0];
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('blackjack')
		.setDescription('Jogue uma partida de Blackjack!'),

	run: async ({ interaction }) => {
		const playerHand = [drawCard(), drawCard()];
		const dealerHand = [drawCard(), drawCard()];

		let playerScore = calculateScore(playerHand);
		let dealerScore = calculateScore(dealerHand);

		const checkNatural = (hand, score) =>
			hand.length === 2 && score === 21;

		// Check for Natural Blackjack
		if (checkNatural(playerHand, playerScore) && checkNatural(dealerHand, dealerScore)) {
			await interaction.reply(`**Empate!** Ambos têm Blackjack!\n**Suas cartas:** ${playerHand.join(', ')}\n**Cartas do dealer:** ${dealerHand.join(', ')}`);
			return;
		} else if (checkNatural(playerHand, playerScore)) {
			await interaction.reply(`**Você ganhou com um Blackjack!**\n**Suas cartas:** ${playerHand.join(', ')}\n**Cartas do dealer:** ${dealerHand.join(', ')}`);
			return;
		} else if (checkNatural(dealerHand, dealerScore)) {
			await interaction.reply(`**O dealer ganhou com um Blackjack!**\n**Suas cartas:** ${playerHand.join(', ')}\n**Cartas do dealer:** ${dealerHand.join(', ')}`);
			return;
		}

		let gameMessage = `**Suas cartas:** ${playerHand.join(', ')} (Total: ${playerScore})\n`;
		gameMessage += `**Cartas do dealer:** ${dealerHand[0]}, ?\n`;

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('hit')
					.setLabel('Pedir Carta')
					.setStyle(ButtonStyle.Primary), // Use ButtonStyle enum
				new ButtonBuilder()
					.setCustomId('stand')
					.setLabel('Parar')
					.setStyle(ButtonStyle.Secondary) // Use ButtonStyle enum
			);

		const reply = await interaction.reply({ content: gameMessage, components: [row], fetchReply: true });

		const filter = (buttonInteraction) => buttonInteraction.user.id === interaction.user.id;

		const collector = reply.createMessageComponentCollector({ filter, time: 30000 });

		collector.on('collect', async (buttonInteraction) => {
			if (buttonInteraction.customId === 'hit') {
				playerHand.push(drawCard());
				playerScore = calculateScore(playerHand);

				if (playerScore > 21) {
					await buttonInteraction.update({
						content: `**Suas cartas:** ${playerHand.join(', ')} (Total: ${playerScore})\nVocê estourou! O dealer ganha.`,
						components: []
					});
					collector.stop();
				} else {
					await buttonInteraction.update({
						content: `**Suas cartas:** ${playerHand.join(', ')} (Total: ${playerScore})\n**Cartas do dealer:** ${dealerHand[0]}, ?`,
						components: [row]
					});
				}
			} else if (buttonInteraction.customId === 'stand') {
				while (dealerScore < 17) {
					dealerHand.push(drawCard());
					dealerScore = calculateScore(dealerHand);
				}

				let resultMessage = `**Suas cartas:** ${playerHand.join(', ')} (Total: ${playerScore})\n`;
				resultMessage += `**Cartas do dealer:** ${dealerHand.join(', ')} (Total: ${dealerScore})\n`;

				if (dealerScore > 21 || playerScore > dealerScore) {
					resultMessage += 'Você ganhou!';
				} else if (playerScore < dealerScore) {
					resultMessage += 'O dealer ganhou!';
				} else {
					resultMessage += 'É um empate!';
				}

				await buttonInteraction.update({ content: resultMessage, components: [] });
				collector.stop();
			}
		});

		collector.on('end', async (_, reason) => {
			if (reason !== 'user') {
				await interaction.followUp({ content: 'O tempo para jogar acabou!', ephemeral: true });
			}
		});
	},
};

*/