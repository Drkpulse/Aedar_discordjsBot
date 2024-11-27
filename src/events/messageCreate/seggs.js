const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

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

	if (content.includes('tu não prendas o cabelo')) {
		// Reply to the message
		message.reply('https://youtu.be/7mVPolmgZtQ');
	}

	if (content.includes('porém não posso')) {
		// Reply to the message
		message.reply('https://youtu.be/0_2zoei3-xg');
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
		{
			text: 'Banana é a fruta do amor! 🍌❤️',
			gif: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExamxoODgwbDc1aGJsbTQzbmR3NzBqNXk5cGhsdDh4cHZhd3dqOXJsbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l1J9u875dGnfINaMw/giphy.gif'
		},
		{
			text: 'A banana é rica em potássio! 🥳'
		},
		{
			text: 'Quem não ama uma boa banana? 🍌'
		},
		{
			text: 'Banana split é a melhor sobremesa!',
			gif: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExanI3YzlpaDNpbDl6a2czbXBlZHByOG5jYndnejU5MXVncDgwbXI5YiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l4EpcH8v3eVqlx0fm/giphy.gif'
		},
		{
			text: 'Banana é a solução para tudo!'
		},
		{
			text: 'Vamos fazer um smoothie de banana? 🍹',
			gif: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWp0bmVsNnBndGI5b21qMmg3bmQ5eXJzbm94NjYxNHozY2M4cWF3YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/foS3OAtNXnuXC/giphy.gif'
		},
		{
			text: 'A banana é perfeita para um lanche saudável!',
			gif: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM29nMXBsODBuYTVidmVkdnRqbWVvdnl1Z2RmeWIyc2tmY2dqYm03ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1AD3TMRwXlNgk/giphy.gif'
		},
		{
			text: 'THIS IS BANANA!',
			gif: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWFxY2RtbjJrcnhocHk4NGR6NDN5eHVzZmRnZ2J0bjcxYWg5MDJ6NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/131JBvo8iAEFYk/giphy.gif'
		},
	];

	// Choose a random reply
	const randomIndex = Math.floor(Math.random() * replies.length);
	const reply = replies[randomIndex];

	// Reply to the message with the selected text and gif
	 if (reply.gif) {
		message.reply({
			content: reply.text,
			files: [reply.gif]
		});
	} else {
		message.reply(reply.text);
	}
}

if (content.includes('não gosto de patinar')) {
	// Reply to the message with a fake kick message
	message.reply(`${message.author} foi removido do servidor por não gostar de patinar.`);
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

  // Check for links in the message
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = content.match(urlRegex);

  if (urls) {
	  // Check each URL for malicious content
	  urls.forEach(url => {
		  checkMaliciousLink(url, message);
	  });
  }
};

// Function to check if a link is malicious using VirusTotal API
async function checkMaliciousLink(url, message) {
  try {
	  const response = await axios.get(`https://www.virustotal.com/api/v3/urls/${Buffer.from(url).toString('base64')}`, {
		  headers: {
			  'x-apikey': VIRUSTOTAL_API_KEY
		  }
	  });

	  // Assuming the API returns a JSON object with a 'data' field containing the 'attributes'
	  const maliciousCount = response.data.data.attributes.last_analysis_stats.malicious;

	  if (maliciousCount > 0) {
		  message.reply(`Warning: The link you posted (${url}) is potentially malicious!`);
	  }
  } catch (error) {
	  console.error('Error checking link:', error);
	  message.reply('There was an error checking the link. Please try again later.');
  }
};

