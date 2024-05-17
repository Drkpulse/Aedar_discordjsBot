const { Translate } = require('@google-cloud/translate').v2;
const { EmbedBuilder } = require('discord.js');

const translate = new Translate({ key: process.env.GOOGLE_API_KEY });

const flagToLanguage = {
	"🇺🇸": "en",
	"🇫🇷": "fr",
	"🇩🇪": "de",
	"🇪🇸": "es",
	"🇮🇹": "it",
	"🇯🇵": "ja",
	"🇷🇺": "ru",
	"🇧🇷": "pt",
	"🇵🇹": "pt",
	// Add more flags and their corresponding languages here
};


module.exports = async (reaction, user, client) => {
	try {
		if (reaction.message.partial) await reaction.message.fetch();
		if (reaction.partial) await reaction.fetch();
		if (user.bot) return;

		const message = reaction.message;
		const emoji = reaction.emoji.name;

		//console.log(`Received reaction: ${emoji} from user: ${user.tag}`);

		if (!flagToLanguage[emoji]) {
			return;
		}

		const targetLanguage = flagToLanguage[emoji];
		const text = message.content;

		//console.log(`Translating message: "${text}" to language: ${targetLanguage}`);

		// Use the translate API to translate the message
		const [translations] = await translate.translate(text, targetLanguage);

		//console.log('Translation API response:', translations);

		const translatedText = Array.isArray(translations) ? translations[0] : translations;
		//console.log(`Translated text: ${translatedText}`);

		const embed = new EmbedBuilder()
			.setColor('#9966cc')
			.setTitle('Translation')
			.setDescription(`Translated to **${targetLanguage}**:\n${translatedText}`)
			.setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) });

		await message.reply({ embeds: [embed] });

	// Log command usage
	const date = new Date();
	const dateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

	console.log(`[${dateTime}] User: ${user.tag} | Interaction: Reaction Translation to ${targetLanguage}`);

	} catch (error) {
		console.error('Error handling reaction:', error);
		await reaction.message.reply('Sorry, I couldn\'t translate the message.');
	}
};
