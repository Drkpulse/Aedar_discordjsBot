import axios from 'axios';
import { isAutomaticFeatureEnabled } from '../../../helpers/featureManager.js';

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

export default (message, client) => {
	// Convert the message content to lowercase for case-insensitive matching
	const content = message.content.toLowerCase();

	if (message.author.bot)
		return true;

	if (!isAutomaticFeatureEnabled('autoReplies', message.guildId))
		return;

	// Check if both "josé" and "beirão" are present in the message content
	if (content.includes('josé') && content.includes('beirão')) {
		// Reply to the message
		message.reply('Esse gajo é mesmo fixe!');
	}

	if (content.includes('tu não prendas o cabelo')) {
		// Generate a random number between 0 and 1
		const randomValue = Math.random();

		if (randomValue < 0.5) {
			// Reply to the message
			message.reply('https://youtu.be/7mVPolmgZtQ');
		}
	}

	if (content.includes('porém não posso')) {
		// Generate a random number between 0 and 1
		const randomValue = Math.random();

		if (randomValue < 0.7) {
			// Reply to the message
			message.reply('https://youtu.be/0_2zoei3-xg');
		}
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
	// Generate a random number between 0 and 1
	const randomValue = Math.random();

	if (randomValue < 0.3) {
		// Reply to the message
		if (reply.gif) {
			message.reply({
				content: reply.text,
				files: [reply.gif]
			});
		} else {
			message.reply(reply.text);
		}
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

		// Yoda-like sentence structure: move the last part of the sentence to the beginning
		const lastIndex = words.length - 1;
		const firstPart = words.slice(0, lastIndex);
		const secondPart = words.slice(lastIndex);

		// Rearranging the sentence to mimic Yoda's style
		let yodaSentence = [...secondPart, ...firstPart].join(' ');

		// Add a more Yoda-like twist by reversing the order of the first part
		if (firstPart.length > 1) {
			yodaSentence = [...firstPart.reverse(), ...secondPart].join(' ');
		}

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

// List of domains to ignore
const ignoredDomains = [
	'discord.com',
	'instagram.com',
	'facebook.com',
	'youtube.com',
	'google.com',
	'tiktok.com',
];

if (urls) {
	// Check each URL for malicious content
	urls.forEach(url => {
		const urlObj = new URL(url);
		const domain = urlObj.hostname;

		// Check if the domain is in the ignored list
		if (!ignoredDomains.includes(domain)) {
			checkMaliciousLink(url, message, client);
		}
	});
}
};

// Function to check if a link is malicious using VirusTotal API
async function checkMaliciousLink(url, message, client) {
  const errorChannelId = process.env.ERROR_CHANNELID;
  try {
	// Properly encode the URL
	const encodedUrl = Buffer.from(url).toString('base64').replace(/=+$/, '');

	// Send the request to VirusTotal
	const response = await axios.get(`https://www.virustotal.com/api/v3/urls/${encodedUrl}`, {
	  headers: {
		'x-apikey': process.env.VIRUSTOTAL_API_KEY, // Ensure the API key is securely stored
	  },
	});

	// Extract the malicious count
	const maliciousCount = response.data.data.attributes.last_analysis_stats.malicious;

	if (maliciousCount > 1) {
	  const reportLink = `https://www.virustotal.com/gui/url/${encodedUrl}`;
	  message.reply(`<:malware:1311831679241031730> **ATENÇÃO**: O link que foi postado (${url}) é potencialmente perigoso! <:malware:1311831679241031730> \n [Mais Info](<${reportLink}>)`);
	}
  } catch (error) {
	console.error('Error checking link:', error.response?.status || error.message);

	try {
	  // Fetch the error channel
	  const errorChannel = await client.channels.fetch(errorChannelId);
	  if (errorChannel) {
		const errorMessage = error.response?.status === 404
		  ? `URL não encontrada: ${url}`
		  : `Erro ao verificar o link: ${url}\n${error.response?.status || error.message}`;

		errorChannel.send(`**Erro ao verificar link:**\n${errorMessage}`);
	  } else {
		console.error(`Error channel not found: ${errorChannelId}`);
	  }
	} catch (channelError) {
	  console.error('Error sending message to error channel:', channelError.message);
	}
  }
}


