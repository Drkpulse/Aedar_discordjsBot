import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';

export const command = new SlashCommandBuilder()
	.setName('yesno')
	.setDescription('Recebe uma resposta aleatória de "sim" ou "não"').toJSON();

export const chatInput = async ({ interaction }) => {
	try {
		const response = await axios.get('https://yesno.wtf/api');
		const { answer, image } = response.data;

		if (answer && image) {
			await interaction.reply({
				content: `**${answer}**`,
				embeds: [{
					image: {
						url: image,
					},
				}],
				ephemeral: false
			});
		} else {
			throw new Error('No answer found.');
		}
	} catch (error) {
		console.error('Error fetching yes/no response:', error);
		await interaction.reply({ content: 'Ocorreu um erro ao buscar a resposta. Tente novamente mais tarde.', ephemeral: true });
	}
};

export const options = {
	cooldown: '10s',
};
