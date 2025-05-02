const { EmbedBuilder } = require('discord.js');
const { getDatabase } = require('../../helpers/mongoClient');
const axios = require('axios');

module.exports = async (client) => {
    console.log('Birthday checker initialized');

    // Run birthday check once on startup (in case the bot was offline during midnight)
    await checkBirthdays(client);

    // Schedule the birthday check to run at midnight every day
    scheduleNextMidnightCheck(client);
};

function scheduleNextMidnightCheck(client) {
    const now = new Date();
    const midnight = new Date();

    // Set time to next midnight (00:00:00)
    midnight.setDate(now.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);

    // Calculate ms until midnight
    const msUntilMidnight = midnight.getTime() - now.getTime();

    console.log(`Next birthday check scheduled in ${Math.floor(msUntilMidnight / 1000 / 60)} minutes`);

    // Schedule the check
    setTimeout(() => {
        // Run the check
        checkBirthdays(client).catch(err => console.error('Birthday check error:', err));

        // Schedule the next check
        scheduleNextMidnightCheck(client);

        // Log that we ran the check
        console.log(`Birthday check executed at ${new Date().toLocaleString()}`);
    }, msUntilMidnight);
}

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

        if (todayBirthdays.length === 0) {
            console.log(`No birthdays today (${currentDay}/${currentMonth})`);
            return;
        }

        console.log(`Found ${todayBirthdays.length} birthdays for today (${currentDay}/${currentMonth})`);

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
            console.log(`Sent birthday message for <@${birthday.userId}>`);
        }
    } catch (error) {
        console.error('Error checking birthdays:', error);
    }
}
