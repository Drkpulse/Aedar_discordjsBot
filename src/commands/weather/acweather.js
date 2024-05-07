const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('acweather')
        .setDescription('Get current weather information for a location')
        .addStringOption((option) =>
            option
                .setName('location')
                .setDescription('The location for which you want to get weather information')
                .setRequired(true)
        ),

    run: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true });

        try {
            const location = interaction.options.getString('location');
            const apiKey = process.env.ACCUWEATHER_API_KEY;

            // Fetch location key from AccuWeather API
            const locationResponse = await axios.get(`http://dataservice.accuweather.com/locations/v1/cities/search`, {
                params: {
                    apikey: apiKey,
                    q: location,
                }
            });

            // Check if location is found
            if (locationResponse.data.length === 0) {
                await interaction.followUp({ content: 'Location not found. Please try again with a valid location.', ephemeral: true });
                return;
            }

            const locationKey = locationResponse.data[0].Key;

            // Fetch current conditions from AccuWeather API
            const currentConditionsResponse = await axios.get(`http://dataservice.accuweather.com/currentconditions/v1/${locationKey}`, {
                params: {
                    apikey: apiKey,
                }
            });

            const weatherData = currentConditionsResponse.data[0];

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Current Weather in ${location}`)
                .setDescription(weatherData.WeatherText)
                .addFields(
                    { name: 'Temperature', value: `${weatherData.Temperature.Metric.Value}°C`, inline: true },
                    { name: 'Feels Like', value: `${weatherData.RealFeelTemperature.Metric.Value}°C`, inline: true },
                    { name: 'Humidity', value: `${weatherData.RelativeHumidity}%` },
                    { name: 'Wind Speed', value: `${weatherData.Wind.Speed.Metric.Value} km/h ${weatherData.Wind.Direction.Localized}` },
                )
                .setTimestamp()
                .setFooter('Data provided by AccuWeather');

            await interaction.followUp({ embeds: [embed] });
        } catch (error) {
            await interaction.followUp({ content: 'An error occurred while fetching weather data. Please try again later.', ephemeral: true });
            console.error('Error fetching weather data:', error);
        }
    },
	options: {
		//cooldown: '1h',
		devOnly: true,
		//userPermissions: ['Adminstrator'],
		//botPermissions: ['BanMembers'],
		//deleted: true,
	},
};
