const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate();

const flagToLanguage = {
    "🇺🇸": "en",
    "🇫🇷": "fr",
    "🇩🇪": "de",
    "🇪🇸": "es",
    "🇮🇹": "it",
    "🇯🇵": "ja",
    // Add more flags and their corresponding languages here
};

module.exports = async (reaction, user, client) => {
    try {
        // Ensure the reaction is on a message and not by the bot itself
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
        if (user.bot) return;

        const message = reaction.message;
        const emoji = reaction.emoji.name;

        console.log(`Received reaction: ${emoji} from user: ${user.tag}`);

        if (flagToLanguage[emoji]) {
            const targetLanguage = flagToLanguage[emoji];
            const text = message.content;

            console.log(`Translating message: "${text}" to language: ${targetLanguage}`);

            const [translations] = await translate.translate(text, targetLanguage);
            const translatedText = translations;

            console.log(`Translated text: ${translatedText}`);

            message.reply(`Translated to ${targetLanguage}: ${translatedText}`);
        } else {
            console.log(`Emoji ${emoji} does not correspond to a supported language.`);
        }
    } catch (error) {
        console.error('Error handling reaction:', error);
        message.reply('Sorry, I couldn\'t translate the message.');
    }
};
