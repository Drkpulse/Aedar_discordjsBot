const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('forecast')
		.setDescription('Obter previsão do tempo para um dia específico nos próximos 5 dias')
		.addStringOption(option =>
			option
				.setName('local')
				.setDescription('Local a pesquisar')
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option
				.setName('dia')
				.setDescription('Dia (1-31)')
				.setRequired(true)
		),

	run: async ({ interaction, client, handler }) => {
		await interaction.deferReply({ fetchReply: true });
		const location = interaction.options.getString('local');
		const day = interaction.options.getInteger('dia');
		const currentDate = new Date();
		const currentYear = currentDate.getFullYear();
		const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed in JS Date

		let forecastYear = currentYear;
		let forecastMonth = currentMonth;

		// Check if the provided day is in the next month
		if (day < currentDate.getDate()) {
			forecastMonth += 1;
			if (forecastMonth > 12) {
				forecastMonth = 1;
				forecastYear += 1;
			}
		}

		const date = `${forecastYear}-${forecastMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

		try {
			const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`);
			const forecastData = response.data;

			// Filter forecasts for the specified date
			const filteredForecasts = forecastData.list.filter(forecast => {
				const forecastDate = new Date(forecast.dt * 1000).toISOString().split('T')[0];
				return forecastDate === date;
			});

			if (filteredForecasts.length === 0) {
				await interaction.followUp({ content: 'Não foi encontrado nenhum dado de previsão para a data especificada. Por favor, insere uma data válida dentro dos próximos 5 dias.', ephemeral: true });
				return;
			}

			const fields = filteredForecasts.map(forecast => {
				const forecastDateTime = new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
				const weatherIconUrl = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
				const windEmoji = getWindDirectionEmoji(forecast.wind.deg);
				const rainChance = forecast.pop ? `${Math.round(forecast.pop * 100)}%` : 'N/A';

				return {
					name: `${forecastDateTime}`,
					value: `${forecast.weather[0].description}\n🌡️ ${forecast.main.temp}°C\n💨 ${forecast.wind.speed} m/s ${windEmoji}\n🌧️ ${rainChance}`,
					inline: true,
					icon_url: weatherIconUrl, // Add the icon URL to the field
				};
			});

			const dayWeatherIconUrl = `http://openweathermap.org/img/wn/${filteredForecasts[0].weather[0].icon}@4x.png`;

			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(`Previsão do tempo para ${location} em ${date}`)
				.addFields(fields)
				.setThumbnail(dayWeatherIconUrl)
				.setTimestamp()
				.setFooter({ text: 'Dados fornecidos por OpenWeatherMap', iconURL: 'https://avatars.githubusercontent.com/u/1743227?s=200&v=4' });

			await interaction.followUp({ embeds: [embed] });
		} catch (error) {
			await interaction.followUp({ content: 'Ocorreu um erro ao obter os dados da previsão do tempo. Por favor, tente novamente mais tarde.', ephemeral: true });
			console.error('Error fetching forecast data:', error);
		}
	},
	options: {
		cooldown: '30s',
	},
};

function getWindDirectionEmoji(degrees) {
	const emojiDirections = ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'];
	const index = Math.round(degrees / 45) % 8;
	return emojiDirections[index];
}
