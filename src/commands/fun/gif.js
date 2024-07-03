const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gif')
		.setDescription('Procura um "random" Gif da vasta internet')
		.addStringOption(option =>
			option.setName('keyword')
				.setDescription('Palavra-chave')
				.setRequired(true)),

	run: async ({ interaction }) => {
		const keyword = interaction.options.getString('keyword');

		try {
			const response = await axios.get(`https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_API}&tag=${keyword}&rating=g`);
			const gifUrl = response.data;

			console.log(response.data.data.embed_url);

			if (gifUrl.data.embed_url) {
				await interaction.reply({ content: gifUrl.data.embed_url, ephemeral: false });
			} else {
				throw new Error('No GIF found for the specified keyword.');
			}
		} catch (error) {
			console.error('Error fetching gif:', error);
			await interaction.reply({ content: 'An error occurred while fetching the gif. Please try again later.', ephemeral: true });
		}
	},
	options: {
		cooldown: '10s',
	},
};
