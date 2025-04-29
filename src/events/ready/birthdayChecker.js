const { EmbedBuilder } = require('discord.js');
const { getDatabase } = require('../../helpers/mongoClient');
const axios = require('axios');

module.exports = async (client) => {
	console.log('Birthday checker initialized');

	// Run birthday check once on startup
	await checkBirthdays(client);

	// Schedule birthday check to run daily at midnight
	setInterval(() => checkBirthdays(client), 24 * 60 * 60 * 1000);
};

async function checkBirthdays(client) {
	try {
		const today = new Date();
		const currentDay = today.getDate();
		const currentMonth = today.getMonth() + 1;

		const db = await getDatabase();
		const birthdaysCollection = db.collection('birthdays');

		// Find birthdays that match today's date
		const todayBirthdays = await birthdaysCollection.find({
			day: currentDay,
			month: currentMonth
		}).toArray();

		if (todayBirthdays.length === 0) return;

		// Get the announcement channel
		const birthdayChannelId = process.env.BIRTHDAY_CHANNELID || process.env.WELCOME_CHANNELID;
		if (!birthdayChannelId) {
			console.error('No birthday channel ID configured');
			return;
		}

		const birthdayChannel = await client.channels.fetch(birthdayChannelId);
		if (!birthdayChannel) {
			console.error('Could not find birthday channel');
			return;
		}

		// Send birthday announcements
		for (const birthday of todayBirthdays) {
			const birthdayMessages = [
				`🎉 Hoje é o aniversário de <@${birthday.userId}>! Parabéns! 🎂`,
				`🎊 O grande dia chegou! Feliz aniversário, <@${birthday.userId}>! 🎈`,
				`🎁 Quem está pronto para a festa? <@${birthday.userId}> está a comemorar o seu aniversário hoje! 🎯`,
				`🥳 Tantos anos, tantas voltas de patins! Feliz aniversário <@${birthday.userId}>! ⭐`,
				`🎂 Hoje temos um dia especial, <@${birthday.userId}> faz anos! Preparados para celebrar? 🎊`
			];

			const randomMessage = birthdayMessages[Math.floor(Math.random() * birthdayMessages.length)];

			// Get a random birthday GIF from Giphy
			let gifUrl = '';
			try {
				// Random search terms for birthday gifs
				const searchTerms = [
					'happy birthday',
					'birthday cake',
					'birthday party',
					'birthday celebration',
					'birthday dance',
					'birthday fun',
					'skating birthday'
				];

				const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

				const response = await axios.get(
					`https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_API}&tag=${randomTerm}&rating=g`
				);

				if (response.data && response.data.data && response.data.data.images) {
					gifUrl = response.data.data.images.original.url;
				}
			} catch (error) {
				console.error('Error fetching birthday GIF:', error);
				// Fallback GIF if API request fails
				gifUrl = 'https://i.giphy.com/media/SwImQhtiNA7io/giphy.gif';
			}

			const embed = new EmbedBuilder()
				.setTitle('🎂 Feliz Aniversário! 🎂')
				.setDescription(randomMessage)
				.setColor('#FF69B4')
				.setImage(gifUrl);

			await birthdayChannel.send({ embeds: [embed] });
		}
	} catch (error) {
		console.error('Error checking birthdays:', error);
	}
}
