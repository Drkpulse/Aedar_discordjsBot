const translate = require('translate-google');

module.exports = async (message, reaction, client) => {
	console.log("Reacted");
	const emoji = reaction.emoji.toString();

	// Check if the reaction is a country flag emoji
	const countryFlags = {
		'🇺🇸': 'en',
		'🇬🇧': 'en',
		'🇫🇷': 'fr',
		'🇩🇪': 'de',
		'🇯🇵': 'ja'
		// Add more country flags and their language codes as needed
	};

	if (countryFlags.hasOwnProperty(emoji)) {
		// Get the text of the original message
		const originalText = message.content;

		// Translate the text to the language associated with the flag
		const translatedText = await translate(originalText, { to: countryFlags[emoji] });

		// Get the user who sent the original message
		const user = message.author;

		// Reply with the translated text
		message.channel.send(`${user.username}, in ${countryFlags[emoji]}: ${translatedText}`);
	}
};
