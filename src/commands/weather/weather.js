const { MessageEmbed } = require('discord.js');
const axios = require('axios');


module.exports = {
	name: 'weather',
	description: 'Pong?',
	// devOnly: Boolean
	// testOnly: Boolean
	options: [
		location = {
			name: 'location',
			description: 'The location to get weather information for',
			type: 'STRING', // Correct type for a string input
			required: true
		},
	],

	// deleted:Boolen
		callback: async (interaction) => {
		await interaction.deferReply();
		const location = await interaction.option;
        const locationa = interaction.option.getString('location');

        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`);
            const weatherData = response.data;
			const windEmoji = getWindDirectionEmoji(weatherData.wind.deg);
            const weatherIcon = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`;

            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Weather in ${weatherData.name}`)
                .setDescription(weatherData.weather[0].description)
                .setThumbnail(weatherIcon)
                .addFields(
                    { name: 'Temperature', value: `${weatherData.main.temp}°C`, inline: true },
                    { name: 'Feels Like', value: `${weatherData.main.feels_like}°C`, inline: true },
                    { name: 'Humidity', value: `${weatherData.main.humidity}%` },
                    { name: 'Wind Speed', value: `${weatherData.wind.speed} m/s ${windEmoji}` },
                )
                .setTimestamp()
                .setFooter('Data provided by OpenWeatherMap', 'https://avatars.githubusercontent.com/u/1743227?s=200&v=4');

            await interaction.reply({ embeds: [embed] });
            console.log(`${new Date().toISOString().replace('T', ' ').split('.')[0]} - ${interaction.user.tag} used /weather for ${location}`);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            await interaction.reply({ content: 'An error occurred while fetching weather data. Please try again later.', ephemeral: true });
        }
    },
};





function getWindDirectionEmoji(degrees) {
    const emojiDirections = ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'];
    const index = Math.round(degrees / 45) % 8;
    return emojiDirections[index];
};
