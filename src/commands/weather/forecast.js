const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('forecast')
		.setDescription('Get the weather forecast for a location')
		.addStringOption(option =>
			option.setName('location')
				.setDescription('The location to get the forecast for')
				.setRequired(true)),

	async run({ interaction }) {
		await interaction.deferReply({ fetchReply: true });
		const location = interaction.options.getString('location');

		try {
			const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`);
			const forecastData = response.data.list;

			forecastData.forEach(data => {
				const date = new Date(data.dt * 1000); // Convert UNIX timestamp to milliseconds
				const timeString = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
				const dateString = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(`Weather Forecast for ${location}`)
				.addFields(
					`${dateString} - ${timeString}`,
					`Temperature: ${data.main.temp}°C\nFeels Like: ${data.main.feels_like}°C\nDescription: ${data.weather[0].description}`
				);
			});

			await interaction.followUp({ embeds: [embed] });
		} catch (error) {
			await interaction.followUp({ content: 'An error occurred while fetching the forecast data. Please try again later.', ephemeral: true });
			console.error('Error fetching forecast data:', error);
		}
		// Log command usage
		const date = new Date();
		const dateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
		const user = interaction.user.tag;
		const interactionId = interaction.commandName;

		console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
	},
	options: {
		//cooldown: '1h',
		devOnly: true,
		//userPermissions: ['Adminstrator'],
		//botPermissions: ['BanMembers'],
		//deleted: true,
	},
};
