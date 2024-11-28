const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coinflip')
		.setDescription('Atira uma bitcoin ao ar!'),

	run: async ({ interaction, client, handler }) => {
		await interaction.deferReply({ fetchReply: true });

		// Construct the custom emoji strings
		const headsEmoji = `<:bit_head:1240722456873009274>`;
		const tailsEmoji = `<:bit_tail:1240722455530700921>`;

		// Initial message to indicate the coin is being flipped
		await interaction.editReply(`<:coinflip:1243537240815304766> A Bitcoin está a ser minerada...`);

		// Simulate the hash generation process
		const totalHashes = 20;
		const delay = 150; // 150 milliseconds delay for 20 hashes in 3 seconds

		for (let i = 0; i < totalHashes; i++) {
			await new Promise(resolve => setTimeout(resolve, delay)); // Delay for each hash
			const hashMessage = `🔄 Gerando hash: ${generateRandomHash()}`;
			await interaction.editReply(`<:coinflip:1243537240815304766> ${hashMessage}`);
		}

		// Final outcome after the mining simulation
		const outcome = Math.random() <= 0.5 ? 'Cara' : 'Coroa';
		const emoji = outcome === 'Cara' ? headsEmoji : tailsEmoji;

		// Reveal the outcome after the mining simulation
		await interaction.editReply(`<:coinflip:1243537240815304766> A Bitcoin que saiu da blockchain é **${outcome} ${emoji}**`);
	},
	options: {
		cooldown: '20s',
	},
};

// Function to generate a random hash-like string
function generateRandomHash() {
	const characters = '0123456789abcdef';
	let hash = '';
	for (let i = 0; i < 64; i++) {
		hash += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return hash;
}
