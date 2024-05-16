module.exports = async (reaction, user) => {
	console.log("Reaction");
    // Ignore bot reactions
    if (user.bot) return;

    // Get the reacted message
    const message = reaction.message;

    // Check if the message is a text message
    if (!message || !message.content) return;

    // Get the content of the message
    const content = message.content;

    // Get the emoji that was reacted with
    const emoji = reaction.emoji.name;

    // Check if the emoji is a flag emoji
    const flagRegex = /[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/;
    if (!flagRegex.test(emoji)) return;

    // Extract the country code from the flag emoji
    const countryCode = emoji.codePointAt(0).toString(16).toUpperCase();

    try {
        // Dynamic import of node-fetch
        const fetch = await import('node-fetch');

        // Translate the message content to the language represented by the flag
        const response = await fetch.default(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${countryCode}&dt=t&q=${encodeURIComponent(content)}`);
        const json = await response.json();
        const translatedText = json[0][0][0];

        // Reply with the translated text
        message.channel.send(`Translation for ${emoji}: ${translatedText}`);
    } catch (error) {
        console.error('Error translating message:', error);
    }
};
