const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { getDatabase } = require('../../helpers/mongoClient');

const API_URL = 'https://deckofcardsapi.com/api/deck';

let deckId;

const cardEmojis = {
	'AS': '<:aceofspades:1312133655220584478>',
	'2S': '<:twoofspades:1312378459812790324>',
	'3S': '<:threeofspades:1312378409921282078>',
	'4S': '<:fourofspades:1312377260065558538>',
	'5S': '<:fiveofspades:1312377119145197662>',
	'6S': '<:sixofspades:1312378208011812955>',
	'7S': '<:sevenofspades:1312378138809860106>',
	'8S': '<:eightofspades:1312377053588488213>',
	'9S': '<:nineofspades:1312377619521601577>',
	'10S': '<:tenofspades:1312378331513094196>',
	'JS': '<:jackofspades:1312377328667590706>',
	'QS': '<:queenofspades:1312377922073657435>',
	'KS': '<:kingofspades:1312377431147155496>',
	'AH': '<:aceofhearts:1312133630923112458>',
	'2H': '<:twoofhearts:1312378448341241867>',
	'3H': '<:threeofhearts:1312378392980488192>',
	'4H': '<:fourofhearts:1312377170072436736>',
	'5H': '<:fiveofhearts:1312377102347014194>',
	'6H': '<:sixofhearts:1312378186067214449>',
	'7H': '<:sevenofhearts:1312378122007740487>',
	'8H': '<:eightofhearts:1312377038157647933>',
	'9H': '<:nineofhearts:1312377507592405122>',
	'10H': '<:tenofhearts:1312378307265957960>',
	'JH': '<:jackofhearts:1312377313349865513>',
	'QH': '<:queenofhearts:1312377894965612615>',
	'KH': '<:kingofhearts:1312377408606703696>',
	'AD': '<:aceofdiamonds:1312133620806451241>',
	'2D': '<:twoofdiamonds:1312378432604209252>',
	'3D': '<:threeofdiamonds:1312378374022365234>',
	'4D': '<:fourofdiamonds:1312377150787027006>',
	'5D': '<:fiveofdiamonds:1312377081493061733>',
	'6D': '<:sixofdiamonds:1312378166689660938>',
	'7D': '<:sevenofdiamonds:1312378082576961629>',
	'8D': '<:eightofdiamonds:1312133680424157285>',
	'9D': '<:nineofdiamonds:1312377486562168892>',
	'10D': '<:tenofdiamonds:1312378257701867570>',
	'JD': '<:jackofdiamonds:1312377300913754153>',
	'QD': '<:queenofdiamonds:1312377741353418823>',
	'KD': '<:kingofdiamonds:1312377379813064795>',
	'AC': '<:aceofclubs:1312133599549722764>',
	'2C': '<:twoofclubs:1312378420700643359>',
	'3C': '<:threeofclubs:1312378353654829056>',
	'4C': '<:fourofclubs:1312377136715141140>',
	'5C': '<:fiveofclubs:1312377065588129833>',
	'6C': '<:sixofclubs:1312378152852656138>',
	'7C': '<:sevenofclubs:1312377954667593739>',
	'8C': '<:eightofclubs:1312133666914172969>',
	'9C': '<:nineofclubs:1312377471097901166>',
	'10C': '<:tenofclubs:1312378235597885540>',
	'JC': '<:jackofclubs:1312377281662029954>',
	'QC': '<:queenofclubs:1312377697665552465>',
	'KC': '<:kingofclubs:1312377355070734406>',
  };

// Function to get the custom emoji for a card
const getCardEmoji = (card) => cardEmojis[card.code] || '<:playingcard:1312377661993127946>';

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

// Function to get or create player stats
async function getPlayerStats(userId) {
	const db = await getDatabase();
	const statsCollection = db.collection('blackjack_stats');

	const playerStats = await statsCollection.findOne({ userId });

	if (playerStats) {
		return playerStats;
	} else {
		// Create new stats document for first-time players
		const newStats = {
			userId,
			gamesPlayed: 0,
			gamesWon: 0,
			gamesLost: 0,
			gamesTied: 0,
			blackjacks: 0,
			busts: 0,
			lastPlayed: new Date()
		};

		await statsCollection.insertOne(newStats);
		return newStats;
	}
}

// Function to update player stats after game
async function updatePlayerStats(userId, result, hadBlackjack = false, busted = false) {
	const db = await getDatabase();
	const statsCollection = db.collection('blackjack_stats');

	const updateData = {
		$inc: {
			gamesPlayed: 1,
			lastPlayed: new Date()
		}
	};

	// Update specific stats based on game result
	if (result === 'win') {
		updateData.$inc.gamesWon = 1;
		if (hadBlackjack) {
			updateData.$inc.blackjacks = 1;
		}
	} else if (result === 'lose') {
		updateData.$inc.gamesLost = 1;
		if (busted) {
			updateData.$inc.busts = 1;
		}
	} else if (result === 'tie') {
		updateData.$inc.gamesTied = 1;
	}

	await statsCollection.updateOne(
		{ userId },
		updateData,
		{ upsert: true }
	);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('blackjack')
		.setDescription('Jogue uma partida de Blackjack!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('stats')
				.setDescription('Ver suas estatísticas de Blackjack')),

	run: async ({ interaction }) => {
		// Check if the user is requesting stats
		if (interaction.options.getSubcommand(false) === 'stats') {
			try {
				const userId = interaction.user.id;
				const stats = await getPlayerStats(userId);

				const winRate = stats.gamesPlayed > 0
					? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)
					: 0;

				const statsEmbed = new EmbedBuilder()
					.setColor('#0099ff')
					.setTitle('🃏 Suas Estatísticas de Blackjack')
					.setDescription(`Estatísticas para ${interaction.user.username}`)
					.addFields(
						{ name: 'Partidas Jogadas', value: stats.gamesPlayed.toString(), inline: true },
						{ name: 'Vitórias', value: stats.gamesWon.toString(), inline: true },
						{ name: 'Derrotas', value: stats.gamesLost.toString(), inline: true },
						{ name: 'Empates', value: stats.gamesTied.toString(), inline: true },
						{ name: 'Taxa de Vitória', value: `${winRate}%`, inline: true },
						{ name: 'Blackjacks', value: stats.blackjacks.toString(), inline: true },
						{ name: 'Estouros (Busts)', value: stats.busts.toString(), inline: true }
					)
					.setFooter({ text: 'Use /blackjack para iniciar uma nova partida!' });

				await interaction.reply({ embeds: [statsEmbed], ephemeral: true });
				return;
			} catch (error) {
				console.error('Error retrieving blackjack stats:', error);
				await interaction.reply({
					content: 'Ocorreu um erro ao buscar suas estatísticas. Tente novamente mais tarde.',
					ephemeral: true
				});
				return;
			}
		}

		// Default behavior: start a game
		await createDeck(); // Create a new deck

		const playerHand = [await drawCard(), await drawCard()];
		const dealerHand = [await drawCard(), await drawCard()];

		let playerScore = calculateScore(playerHand);
		let dealerScore = calculateScore(dealerHand);

		const checkNatural = (hand, score) =>
			hand.length === 2 && score === 21;

		const userId = interaction.user.id;

		// Check for Natural Blackjack
		if (checkNatural(playerHand, playerScore) && checkNatural(dealerHand, dealerScore)) {
			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('**Empate!**')
				.setDescription(`Ambos têm Blackjack!`)
				.addFields(
					{ name: 'Suas cartas', value: playerHand.map(getCardEmoji).join(' '), inline: true },
					{ name: 'Cartas do dealer', value: dealerHand.map(getCardEmoji).join(' '), inline: true }
				);
			await updatePlayerStats(userId, 'tie', true);
			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		} else if (checkNatural(playerHand, playerScore)) {
			const embed = new EmbedBuilder()
				.setColor('#00ff00')
				.setTitle('**Você ganhou com um Blackjack!**')
				.addFields(
					{ name: 'Suas cartas', value: playerHand.map(getCardEmoji).join(' '), inline: true },
					{ name: 'Cartas do dealer', value: dealerHand.map(getCardEmoji).join(' '), inline: true }
				);
			await updatePlayerStats(userId, 'win', true);
			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		} else if (checkNatural(dealerHand, dealerScore)) {
			const embed = new EmbedBuilder()
				.setColor('#ff0000')
				.setTitle('**O dealer ganhou com um Blackjack!**')
				.addFields(
					{ name: 'Suas cartas', value: playerHand.map(getCardEmoji).join(' '), inline: true },
					{ name: 'Cartas do dealer', value: dealerHand.map(getCardEmoji).join(' '), inline: true }
				);
			await updatePlayerStats(userId, 'lose');
			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		// Regular game flow continues...
		const gameEmbed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle('**Sua vez!**')
			.setDescription(`**Suas cartas:** ${playerHand.map(getCardEmoji).join(' ')} (Total: ${playerScore})\n**Cartas do dealer:** ${getCardEmoji(dealerHand[0])}, ?`)
			.setFooter({ text: 'Escolha uma ação abaixo:' });

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

		const reply = await interaction.reply({ embeds: [gameEmbed], components: [row], ephemeral: true, fetchReply: true });

		const filter = (buttonInteraction) => buttonInteraction.user.id === interaction.user.id;
		const collector = reply.createMessageComponentCollector({ filter, time: 30000 });

		collector.on('collect', async (buttonInteraction) => {
			if (buttonInteraction.customId === 'hit') {
				const newCard = await drawCard();
				playerHand.push(newCard);
				playerScore = calculateScore(playerHand);

				if (playerScore > 21) {
					const bustEmbed = new EmbedBuilder()
						.setColor('#ff0000')
						.setTitle('Você estourou!')
						.setDescription(`**Suas cartas:** ${playerHand.map(getCardEmoji).join(' ')} (Total: ${playerScore})\nO dealer ganha.`)
						.setFooter({ text: 'Fim do jogo' });
					await updatePlayerStats(userId, 'lose', false, true);
					await buttonInteraction.update({ embeds: [bustEmbed], components: [] });
					collector.stop();
				} else {
					const updatedEmbed = new EmbedBuilder()
						.setColor('#0099ff')
						.setTitle('**Sua vez!**')
						.setDescription(`**Suas cartas:** ${playerHand.map(getCardEmoji).join(' ')} (Total: ${playerScore})\n**Cartas do dealer:** ${getCardEmoji(dealerHand[0])}, ?`)
						.setFooter({ text: 'Escolha uma ação abaixo:' });
					await buttonInteraction.update({ embeds: [updatedEmbed], components: [row] });
				}
			} else if (buttonInteraction.customId === 'stand') {
				// Dealer's turn
				while (dealerScore < 17 || (dealerScore === 17 && dealerHand.some(card => card.value === 'ACE'))) {
					const newCard = await drawCard();
					dealerHand.push(newCard);
					dealerScore = calculateScore(dealerHand);
				}

				let resultEmbed = new EmbedBuilder()
					.setColor('#0099ff')
					.setTitle('**Resultado do Jogo**')
					.addFields(
						{ name: 'Suas cartas', value: playerHand.map(getCardEmoji).join(' ') + ` (Total: ${playerScore})`, inline: true },
						{ name: 'Cartas do dealer', value: dealerHand.map(getCardEmoji).join(' ') + ` (Total: ${dealerScore})`, inline: true }
					);

				let gameResult;
				if (dealerScore > 21 || playerScore > dealerScore) {
					resultEmbed.setDescription('Você ganhou!');
					gameResult = 'win';
				} else if (playerScore < dealerScore) {
					resultEmbed.setDescription('O dealer ganhou!');
					gameResult = 'lose';
				} else {
					resultEmbed.setDescription('É um empate!');
					gameResult = 'tie';
				}

				await updatePlayerStats(userId, gameResult);
				await buttonInteraction.update({ embeds: [resultEmbed], components: [] });
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

