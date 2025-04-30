const { Translate } = require('@google-cloud/translate').v2;
const { EmbedBuilder } = require('discord.js');

const translate = new Translate({ key: process.env.GOOGLE_API_KEY });

const flagToLanguage = {
    "🇺🇸": "en",
    "🇬🇧": "en",
    "🇨🇦": "en",
    "🇦🇺": "en",
    "🇳🇿": "en",
    "🇮🇪": "en",
    "🇿🇦": "en",
    "🇮🇳": "hi",
    "🇵🇰": "ur",
    "🇧🇩": "bn",
    "🇷🇴": "ro",
    "🇫🇷": "fr",
    "🇧🇪": "fr",
    "🇨🇭": "fr",
    "🇲🇦": "fr",
    "🇩🇿": "fr",
    "🇹🇳": "fr",
    "🇩🇪": "de",
    "🇦🇹": "de",
    "🇨🇭": "de",
    "🇱🇺": "de",
    "🇪🇸": "es",
    "🇲🇽": "es",
    "🇨🇴": "es",
    "🇦🇷": "es",
    "🇨🇱": "es",
    "🇵🇪": "es",
    "🇻🇪": "es",
    "🇺🇾": "es",
    "🇪🇨": "es",
    "🇵🇦": "es",
    "🇨🇷": "es",
    "🇭🇳": "es",
    "🇬🇹": "es",
    "🇸🇻": "es",
    "🇳🇮": "es",
    "🇵🇾": "es",
    "🇧🇴": "es",
    "🇨🇺": "es",
    "🇩🇴": "es",
    "🇵🇷": "es",
    "🇮🇹": "it",
    "🇻🇦": "it",
    "🇸🇲": "it",
    "🇯🇵": "ja",
    "🇰🇷": "ko",
    "🇨🇳": "zh-CN",
    "🇹🇼": "zh-TW",
    "🇭🇰": "zh-HK",
    "🇸🇬": "zh-SG",
    "🇷🇺": "ru",
    "🇧🇾": "ru",
    "🇰🇿": "ru",
    "🇺🇦": "uk",
    "🇵🇱": "pl",
    "🇨🇿": "cs",
    "🇸🇰": "sk",
    "🇭🇺": "hu",
    "🇷🇴": "ro",
    "🇧🇬": "bg",
    "🇬🇷": "el",
    "🇹🇷": "tr",
    "🇮🇷": "fa",
    "🇦🇪": "ar",
    "🇸🇦": "ar",
    "🇪🇬": "ar",
    "🇮🇶": "ar",
    "🇸🇾": "ar",
    "🇱🇧": "ar",
    "🇯🇴": "ar",
    "🇧🇭": "ar",
    "🇶🇦": "ar",
    "🇴🇲": "ar",
    "🇰🇼": "ar",
    "🇾🇪": "ar",
    "🇲🇦": "ar",
    "🇩🇿": "ar",
    "🇹🇳": "ar",
    "🇱🇾": "ar",
    "🇲🇷": "ar",
    "🇸🇩": "ar",
    "🇸🇴": "ar",
    "🇧🇷": "pt",
    "🇵🇹": "pt",
    "🇦🇴": "pt",
    "🇲🇿": "pt",
    "🇬🇼": "pt",
    "🇨🇻": "pt",
    "🇹🇱": "pt",
    // Add more flags and their corresponding languages as needed
};

module.exports = async (reaction, user, client) => {
    try {
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
        if (user.bot) return;

        const message = reaction.message;
        const emoji = reaction.emoji.name;

        if (!flagToLanguage[emoji]) {
            return;
        }

        const targetLanguage = flagToLanguage[emoji];
        const text = message.content;

        // Send initial loading message
        const initialReply = await message.reply(`🔄 Translating to **${getLanguageName(targetLanguage)}**...`);

        // Use the translate API to translate the message
        const [translations] = await translate.translate(text, targetLanguage);

        const translatedText = Array.isArray(translations) ? translations[0] : translations;

        const embed = new EmbedBuilder()
            .setColor('#9966cc')
            .setTitle('Translation')
            .setDescription(`Translated to **${getLanguageName(targetLanguage)}**:\n${translatedText}`)
            .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) });

        // Edit the loading message with the translated content
        await initialReply.edit({ content: null, embeds: [embed] });

        // Log command usage
        const date = new Date();
        const dateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

        console.log(`[${dateTime}] User: ${user.tag} | Interaction: Reaction Translation to ${targetLanguage}`);

    } catch (error) {
        console.error('Error handling reaction:', error);
        await reaction.message.reply('Sorry, I couldn\'t translate the message.');
    }
};

// Helper function to convert language codes to readable names
function getLanguageName(code) {
    const languageNames = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh-CN': 'Chinese (Simplified)',
        'zh-TW': 'Chinese (Traditional)',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'ur': 'Urdu',
        'bn': 'Bengali',
        'uk': 'Ukrainian',
        'pl': 'Polish',
        'cs': 'Czech',
        'sk': 'Slovak',
        'hu': 'Hungarian',
        'ro': 'Romanian',
        'bg': 'Bulgarian',
        'el': 'Greek',
        'tr': 'Turkish',
        'fa': 'Persian'
    };

    return languageNames[code] || code;
}
