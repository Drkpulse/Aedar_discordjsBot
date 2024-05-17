module.exports = (message, client) => {
	// Convert the message content to lowercase for case-insensitive matching
	const content = message.content.toLowerCase();

	if (message.author.bot)
		return true;

	// Check if both "josé" and "beirão" are present in the message content
	if (content.includes('josé') && content.includes('beirão')) {
		// Reply to the message
		message.reply('Esse gajo é mesmo fixe!');
	}

	// Array of Shrek movie quotes
	const shrekQuotes = [
			"In the morning, I'm making waffles!",
			"Some of you may die, but that is a sacrifice I am willing to make.",
			"Ogres are like onions.",
			"Donkey, two things okay? Shut... up.",
			"I live in a swamp! I put up signs! I'm a terrifying ogre! What do I have to do to get a little privacy?",
			// Add more Shrek quotes as needed
	];

	// Check if the message contains the word "shrek"
	if (content.includes('shrek')) {
		// Select a random quote from the array
		const randomQuote = shrekQuotes[Math.floor(Math.random() * shrekQuotes.length)];

		// Reply to the message with the random quote
		message.reply(randomQuote);

		// Stop the event loop
		return true;
	}

 //		************************ BANANA ************************

 if (content.includes('banana')) {
	// List of replies with optional gifs
	const replies = [
		{
			text: 'Alguém disse banana! <a:neonnana:860913288757248020> Toma lá uma banana digital!',
		},
		{
			text: 'A Banana agora é minha'
		},
		{
			text: 'BANANA!',
			gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmo0ZG5yc21sYnh0bDhjbWpyMnBkNjE0djJpeXp3cGM1cTN0ZTlmOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/bh4jzePjmd9iE/giphy.gif'
		},
		{
			text: 'Uma banana? Mesmo o que eu queria!!',
			gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHFkYjFpemowc2hlb2p3am1tbHE0NDVjM256MDRhbnQ4dGVoZW1waCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nw8mESEGAU9aM/giphy.gif'
		},
		{
			text: 'Uau <a:uau:759825999495561218> , uma Banana',
			gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTFqODAzeWpnN2NjdHR5d2c0dmh1eWF2Zm41OGZpZDI3bTRodWt2MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3RYA2AaoRbJCNk2ey0/giphy.gif'
		},
	];

	// Choose a random reply
	const randomIndex = Math.floor(Math.random() * replies.length);
	const reply = replies[randomIndex];

	// Reply to the message with the selected text and gif (if available)
	if (reply.gif) {
		message.reply(reply.text, { files: [reply.gif] });
	} else {
		message.reply(reply.text);
	}
}



	if (content.includes('preciso de inspiração')) {
		// Reply to the message
		message.reply('Alguém disse banana! 🍌 Toma lá uma banana digital!');
	}

	if (content.includes('não gosto de patinar')) {
		// Reply to the message with a fake kick message
		message.reply('${message.author} foi removido do servidor por não gostar de patinar.');

		// Stop the event loop
		return true;
	}


	function transformToYodaSpeak(text) {
		const sentences = text.split(/[.?!]/).filter(sentence => sentence.trim().length > 0);

		const yodaSentences = sentences.map(sentence => {
			const words = sentence.trim().split(/\s+/);

			// Yoda-like sentence structure: move the second half of the sentence to the beginning
			const middleIndex = Math.floor(words.length / 2);
			const firstPart = words.slice(0, middleIndex);
			const secondPart = words.slice(middleIndex);

			let yodaSentence = [...secondPart, ...firstPart].join(' ');

			// Capitalize the first letter of the transformed sentence
			yodaSentence = yodaSentence.charAt(0).toUpperCase() + yodaSentence.slice(1);

			// Add "mmm" sounds randomly
			if (Math.random() < 0.5) {
				yodaSentence += " mmm";
			}

			// Mix up the punctuation randomly
			const punctuation = ["!", "?", "...", "."];
			const randomPunctuation = punctuation[Math.floor(Math.random() * punctuation.length)];

			yodaSentence += randomPunctuation;

			return yodaSentence.trim();
		});

		const yodaText = yodaSentences.join(' ');

		return yodaText;
	}

	if (content.includes('yoda') && !message.author.bot) {
		// Transform the message content into Yoda-like speak
		const yodaText = transformToYodaSpeak(content);

		// Reply to the message with the Yoda-like text
		message.reply(yodaText);

		// Stop the event loop
		return true;
	}



};
