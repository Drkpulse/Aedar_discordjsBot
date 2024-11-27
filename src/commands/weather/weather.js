const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const consoleLog = require('../../events/ready/console-log');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Verifica como está o tempo')
		.addStringOption((option) =>
			option
				.setName('local')
				.setDescription('Local a pesquisar')
				.setRequired(true)
		),

	run: async ({interaction, client, handler}) => {
		await interaction.deferReply({ fetchReply: true });
		const location = interaction.options.getString('local');
		try {
			const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`);
			const weatherData = response.data;
			const windEmoji = getWindDirectionEmoji(weatherData.wind.deg);
			const weatherIcon = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`;
			const rainChance = weatherData.pop ? `${Math.round(weatherData.pop * 100)}%` : 'N/A';

			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(`Tempo - ${weatherData.name}`)
				.setDescription(weatherData.weather[0].description)
				.setThumbnail(weatherIcon)
				.setTimestamp()
				.setFooter({ text: 'Dados fornecidos por OpenWeatherMap', iconURL: 'https://avatars.githubusercontent.com/u/1743227?s=200&v=4' });

			// Add fields only if the values are valid
			if (weatherData.main.temp !== undefined) {
				embed.addFields({ name: 'Temperatura', value: `${weatherData.main.temp}°C`, inline: true });
			}
			if (weatherData.main.feels_like !== undefined) {
				embed.addFields({ name: 'Sensação', value: `${weatherData.main.feels_like}°C`, inline: true });
			}
			if (weatherData.main.humidity !== undefined) {
				embed.addFields({ name: 'Humidade', value: `${weatherData.main.humidity}%` });
			}
			if (rainChance !== 'N/A') {
				embed.addFields({ name: 'Chuva', value: `${rainChance}`, inline: true });
			}
			if (weatherData.wind.speed !== undefined) {
				embed.addFields({ name: 'Vento', value: `${weatherData.wind.speed} m/s ${windEmoji}`, inline: true });
			}
			embed.addFields({ name: 'Molho', value: `[Website](https://openweathermap.org/city/${weatherData.id})`, inline: true });

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
};


/*
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const consoleLog = require('../../events/ready/console-log');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Verifica como está o tempo')
		.addStringOption((option) =>
			option
				.setName('local')
				.setDescription('Local a pesquisar')
				.setRequired(true)
		),

	run: async ({interaction, client, handler}) => {
		await interaction.deferReply({ fetchReply: true });
		const location = interaction.options.getString('local');
		try {
			const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`);
			const weatherData = response.data;
			const windEmoji = getWindDirectionEmoji(weatherData.wind.deg);
			const weatherIcon = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`;
			const rainChance = weatherData.pop ? `${Math.round(weatherData.pop * 100)}%` : 'N/A';

			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(`Tempo - ${weatherData.name}`)
				.setDescription(weatherData.weather[0].description)
				.setThumbnail(weatherIcon)
				.addFields(
					{ name: 'Temperatura', value: `${weatherData.main.temp}°C`, inline: true },
					{ name: 'Sensação', value: `${weatherData.main.feels_like}°C`, inline: true },
					{ name: 'Humidade', value: `${weatherData.main.humidity}%` },
					{ name: 'Chuva', value: `${rainChance}%`, inline: true},
					{ name: 'Vento', value: `${weatherData.wind.speed} m/s ${windEmoji}`, inline: true },
					{ name: 'Molho', value: `[Website](https://openweathermap.org/city/${weatherData.id})`, inline: true },
				)
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
};
*/