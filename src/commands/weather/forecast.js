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
				await interaction.followUp({
					content: '⚠️ Não foi encontrado nenhum dado de previsão para a data especificada. Por favor, insira uma data válida dentro dos próximos 5 dias.',
					ephemeral: true
				});
				return;
			}

			// Get average temperature and most common weather for the day
			const avgTemp = filteredForecasts.reduce((sum, f) => sum + f.main.temp, 0) / filteredForecasts.length;
			const weatherCounts = {};
			filteredForecasts.forEach(f => {
				const weather = f.weather[0].main;
				weatherCounts[weather] = (weatherCounts[weather] || 0) + 1;
			});
			const dominantWeather = Object.entries(weatherCounts).sort((a, b) => b[1] - a[1])[0][0];

			// Get corresponding icon for the dominant weather
			const dominantIcon = filteredForecasts.find(f => f.weather[0].main === dominantWeather).weather[0].icon;
			const dayWeatherIconUrl = `http://openweathermap.org/img/wn/${dominantIcon}@4x.png`;

			// Format date to be more readable
			const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});

			// City name with first letter capitalized of each word
			const formattedLocation = location
				.split(' ')
				.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
				.join(' ');

			// Create main embed
			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(`🌦️ Previsão do tempo para ${formattedLocation}`)
				.setDescription(`**${formattedDate}**\n\n${getWeatherEmoji(dominantWeather)} **${dominantWeather}** • Média: **${avgTemp.toFixed(1)}°C**`)
				.setThumbnail(dayWeatherIconUrl)
				.setTimestamp()
				.setFooter({
					text: 'Dados fornecidos por OpenWeatherMap',
					iconURL: 'https://avatars.githubusercontent.com/u/1743227?s=200&v=4'
				});

			// Group forecasts by time period (morning, afternoon, evening, night)
			const morning = filteredForecasts.filter(f => {
				const hour = new Date(f.dt * 1000).getHours();
				return hour >= 6 && hour < 12;
			})[0];

			const afternoon = filteredForecasts.filter(f => {
				const hour = new Date(f.dt * 1000).getHours();
				return hour >= 12 && hour < 18;
			})[0];

			const evening = filteredForecasts.filter(f => {
				const hour = new Date(f.dt * 1000).getHours();
				return hour >= 18 && hour < 22;
			})[0];

			const night = filteredForecasts.filter(f => {
				const hour = new Date(f.dt * 1000).getHours();
				return hour >= 22 || hour < 6;
			})[0];

			// Add time period forecasts with morning and night in the first row, afternoon and evening in the second row
			const timeBlocks = [
				{ name: "Madrugada 🌙", data: night, inline: true },
				{ name: "Manhã 🌅", data: morning, inline: true }
			];

			// Add first row of time blocks
			timeBlocks.forEach(block => {
				if (block.data) {
					const forecast = block.data;
					const windEmoji = getWindDirectionEmoji(forecast.wind.deg);
					const rainChance = forecast.pop ? `${Math.round(forecast.pop * 100)}%` : 'N/A';

					embed.addFields({
						name: block.name,
						value: [
							`${getWeatherEmoji(forecast.weather[0].main)} **${forecast.weather[0].description}**`,
							`🌡️ **${forecast.main.temp.toFixed(1)}°C** (Sensação: ${forecast.main.feels_like.toFixed(1)}°C)`,
							`💧 Humidade: ${forecast.main.humidity}%`,
							`💨 Vento: ${forecast.wind.speed.toFixed(1)} m/s ${windEmoji}`,
							rainChance !== 'N/A' ? `🌧️ Chuva: ${rainChance}` : ''
						].filter(line => line).join('\n'),
						inline: true
					});
				}
			});

			// Add second row with afternoon and evening
			const secondRowBlocks = [
				{ name: "Tarde ☀️", data: afternoon, inline: true },
				{ name: "Noite 🌆", data: evening, inline: true }
			];

			secondRowBlocks.forEach(block => {
				if (block.data) {
					const forecast = block.data;
					const windEmoji = getWindDirectionEmoji(forecast.wind.deg);
					const rainChance = forecast.pop ? `${Math.round(forecast.pop * 100)}%` : 'N/A';

					embed.addFields({
						name: block.name,
						value: [
							`${getWeatherEmoji(forecast.weather[0].main)} **${forecast.weather[0].description}**`,
							`🌡️ **${forecast.main.temp.toFixed(1)}°C** (Sensação: ${forecast.main.feels_like.toFixed(1)}°C)`,
							`💧 Humidade: ${forecast.main.humidity}%`,
							`💨 Vento: ${forecast.wind.speed.toFixed(1)} m/s ${windEmoji}`,
							rainChance !== 'N/A' ? `🌧️ Chuva: ${rainChance}` : ''
						].filter(line => line).join('\n'),
						inline: true
					});
				}
			});

			// Add city information
			embed.addFields({
				name: '📍 Molho da Informação',
				value: `[Ver mais detalhes](https://openweathermap.org/city/${forecastData.city.id})`,
				inline: false
			});

			await interaction.followUp({ embeds: [embed] });
		} catch (error) {
			await interaction.followUp({
				content: '❌ Ocorreu um erro ao obter os dados da previsão do tempo. Por favor, tente novamente mais tarde.',
				ephemeral: true
			});
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

function getWeatherEmoji(weatherType) {
	const weatherEmojis = {
		'Clear': '☀️',
		'Clouds': '☁️',
		'Rain': '🌧️',
		'Drizzle': '🌦️',
		'Thunderstorm': '⛈️',
		'Snow': '❄️',
		'Mist': '🌫️',
		'Fog': '🌫️',
		'Haze': '🌫️',
		'Dust': '💨',
		'Smoke': '💨'
	};

	return weatherEmojis[weatherType] || '🌡️';
}
