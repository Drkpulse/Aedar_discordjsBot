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

		// Introduce suspense with a delay
		setTimeout(async () => {
			const outcome = Math.random() <= 0.5 ? 'Cara' : 'Coroa';
			const emoji = outcome === 'Cara' ? headsEmoji : tailsEmoji;

			// Reveal the outcome after the delay
			await interaction.editReply(`<:coinflip:1243537240815304766> A Bitcoin que saiu da blockchain é **${outcome} ${emoji}**`);
		}, 3000); // 3000 milliseconds = 3 seconds delay

	},
	options: {
		cooldown: '1m',
	},
};
