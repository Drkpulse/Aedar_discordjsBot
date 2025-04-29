const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coinflip')
		.setDescription('Mina uma bitcoin!'),

	run: async ({ interaction, client, handler }) => {
		await interaction.deferReply({ fetchReply: true });

		// Construct the custom emoji strings
		const headsEmoji = `<:bitcoin_face:1312379879576305684>`;
		const tailsEmoji = `<:bitcoin_back:1312379892092108891>`;

		// Initial message to indicate the coin is being flipped
		await interaction.editReply(`<:mining:1311818706115887105>  A Bitcoin está a ser minada...`);

		// Simulate the hash generation process
		const totalHashes = 5;
		const delay = 300; // 150 milliseconds delay for 20 hashes in 3 seconds

		for (let i = 0; i < totalHashes; i++) {
			await new Promise(resolve => setTimeout(resolve, delay)); // Delay for each hash
			const hashMessage = `Gerando hash: ${generateRandomHash()}`;
			await interaction.editReply(`<:mining:1311818706115887105>  ${hashMessage}`);
		}

		// Final outcome after the mining simulation
		const outcome = Math.random() <= 0.5 ? 'Cara' : 'Coroa';
		const emoji = outcome === 'Cara' ? headsEmoji : tailsEmoji;

		// Reveal the outcome after the mining simulation
		await interaction.editReply(`<:mining:1311818706115887105>  A Bitcoin minada é **${outcome} ${emoji}**`);
	},
	options: {
		cooldown: '2s',
	},
};

// Function to generate a random hash-like string
function generateRandomHash() {
	const characters = '0123456789abcdef';
	let hash = '';
	for (let i = 0; i < 24; i++) {
		hash += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return hash;
}
