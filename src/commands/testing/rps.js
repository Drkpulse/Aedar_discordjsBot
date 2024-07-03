const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rps')
		.setDescription('Play Rock, Paper, Scissors with the bot or another player.')
		.addStringOption(option =>
			option.setName('choice')
				.setDescription('Your choice: rock, paper, or scissors')
				.setRequired(true))
		.addUserOption(option =>
			option.setName('opponent')
				.setDescription('Select another player to challenge')
				.setRequired(false)),

	run: async ({ interaction, client }) => {
		const userChoice = interaction.options.getString('choice').toLowerCase();
		const opponent = interaction.options.getUser('opponent');

		if (!['rock', 'paper', 'scissors'].includes(userChoice)) {
			await interaction.reply({ content: 'Invalid choice. Please choose rock, paper, or scissors.', ephemeral: true });
			return;
		}

		if (opponent) {
			await challengePlayer(interaction, userChoice, opponent);
		} else {
			await playWithBot(interaction, userChoice);
		}
	},
	options: {
		devOnly: true,
	},
};

async function playWithBot(interaction, userChoice) {
	const choices = ['rock', 'paper', 'scissors'];
	const botChoice = choices[Math.floor(Math.random() * choices.length)];
	const result = getResult(userChoice, botChoice);

	await interaction.reply(`You chose ${userChoice}. The bot chose ${botChoice}. ${result}`);
}

async function challengePlayer(interaction, userChoice, opponent) {
	const filter = i => i.customId.startsWith('rps_') && i.user.id === opponent.id;

	const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder().setCustomId('rps_rock').setLabel('Rock').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('rps_paper').setLabel('Paper').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('rps_scissors').setLabel('Scissors').setStyle(ButtonStyle.Primary),
		);

	await interaction.reply({
		content: `${interaction.user} has challenged ${opponent} to a game of Rock, Paper, Scissors! ${opponent}, please choose your move.`,
		components: [row]
	});

	try {
		const response = await interaction.channel.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 60000 });
		const opponentChoice = response.customId.split('_')[1];
		const result = getResult(userChoice, opponentChoice);

		await response.update({ content: `${interaction.user} chose ${userChoice}. ${opponent} chose ${opponentChoice}. ${result}`, components: [] });
	} catch (err) {
		console.error(err);
		await interaction.editReply({ content: `The challenge timed out as ${opponent} did not respond in time.`, components: [] });
	}
}

function getResult(userChoice, opponentChoice) {
	if (userChoice === opponentChoice) {
		return "It's a tie!";
	} else if (
		(userChoice === 'rock' && opponentChoice === 'scissors') ||
		(userChoice === 'scissors' && opponentChoice === 'paper') ||
		(userChoice === 'paper' && opponentChoice === 'rock')
	) {
		return 'You win!';
	} else {
		return 'You lose!';
	}
}
