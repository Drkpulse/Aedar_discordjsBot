module.exports = (message, client) => {
	// Convert the message content to lowercase for case-insensitive matching
	const content = message.content.toLowerCase();

	// Check if both "josé" and "beirão" are present in the message content
	if (content.includes('josé') && content.includes('beirão')) {
		// Reply to the message
		message.reply('Esse gajo é mesmo fixe!');
	}

	if (content.includes('shrek')) {
		// Reply to the message
		message.reply('random shrek line');
	}

	if (content.includes('banana')) {
		// Reply to the message
		message.reply('Alguém disse banana! 🍌 Toma lá uma banana digital!');
	}

	if (content.includes('preciso inspiração')) {
		// Reply to the message
		message.reply('Alguém disse banana! 🍌 Toma lá uma banana digital!');
	}
};
