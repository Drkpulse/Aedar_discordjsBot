const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const consoleLog = require('../../events/ready/console-log');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Start a activity')
		.addStringOption((option) =>
			option
				.setName('location')
				.setDescription('The activity that you want')
				.setRequired(true)
		),

	run: async ({interaction, client, handler}) => {
	   await interaction.deferReply({ fetchReply: true });
	   const location = interaction.options.getString('location');
		try {
			const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`);
			const weatherData = response.data;
			const windEmoji = getWindDirectionEmoji(weatherData.wind.deg);
			const weatherIcon = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`;

			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(`Weather in ${weatherData.name}`)
				.setDescription(weatherData.weather[0].description)
				.setThumbnail(weatherIcon)
				.addFields(
					{ name: 'Temperature', value: `${weatherData.main.temp}°C`, inline: true },
					{ name: 'Feels Like', value: `${weatherData.main.feels_like}°C`, inline: true },
					{ name: 'Humidity', value: `${weatherData.main.humidity}%` },
					{ name: 'Wind Speed', value: `${weatherData.wind.speed} m/s ${windEmoji}` },
					{ name: 'Source', value: `[Website](https://openweathermap.org/city/${weatherData.id})`, inline: true },
				)
				.setTimestamp()
				.setFooter({ text: 'Data provided by OpenWeatherMap', iconURL: 'https://avatars.githubusercontent.com/u/1743227?s=200&v=4' });

			await interaction.followUp({ embeds: [embed] });
			console.log(`${new Date().toISOString().replace('T', ' ').split('.')[0]} - ${interaction.user.tag} used /weather for ${location}`);
		} catch (error) {
			await interaction.followUp({ content: 'An error occurred while fetching weather data. Please try again later.', ephemeral: true });
			console.error('Error fetching weather data:', error);
		}

	// Log command usage
	const date = new Date();
	const dateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
	const user = interaction.user.tag;
	const interactionId = interaction.commandName;

	console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
	},
	options: {
		cooldown: '30s',
		//devOnly: true,
		//userPermissions: [],
		//botPermissions: [],
		//deleted: false,
	},
};


function getWindDirectionEmoji(degrees) {
	const emojiDirections = ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'];
	const index = Math.round(degrees / 45) % 8;
	return emojiDirections[index];
};
