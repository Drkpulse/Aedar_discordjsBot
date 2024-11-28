const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('8ball')
		.setDescription('Faz uma pergunta e a 8ball responde!')
		.addStringOption(option =>
			option.setName('question')
				.setDescription('A sua pergunta para a 8ball')
				.setRequired(true)),

	run: async ({ interaction, client, handler }) => {
		await interaction.deferReply({ fetchReply: true });

		// List of possible 8ball responses
		const responses = [
			'Sim, definitivamente!',
			'Não, não conte com isso.',
			'Pode ser, mas não conte com certeza.',
			'Sim, mas com cautela.',
			'Não, é melhor não.',
			'As perspectivas não são boas.',
			'Sim, é uma boa ideia.',
			'Pergunte novamente mais tarde.',
			'Não tenho certeza, tente novamente.',
			'Sim, parece promissor.'
		];

		// Get the user's question
		const question = interaction.options.getString('question');

		// Initial message to indicate the 8ball is thinking
		await interaction.editReply(`🎱 A 8ball está a pensar sobre a sua pergunta...`);

		// Introduce suspense with a delay
		setTimeout(async () => {
			const randomIndex = Math.floor(Math.random() * responses.length);
			const answer = responses[randomIndex];

			// Reveal the answer after the delay, including the user's question
			await interaction.editReply(`🎱 Você perguntou: **${question}**\nA 8ball diz: **${answer}**`);
		}, 3000); // 3000 milliseconds = 3 seconds delay
	},

	options: {
		cooldown: '1m',
	},
};
