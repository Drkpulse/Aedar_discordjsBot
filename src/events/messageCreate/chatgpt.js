require('dotenv').config();
const { OpenAI } = require('openai');
const { getDatabase } = require('../../helpers/mongoClient');
const axios = require('axios'); // For web searches

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Constants
const MAX_DISCORD_MESSAGE_LENGTH = 2000;

module.exports = async (message, botClient) => {
	// Ignore bot messages
	if (message.author.bot) return;

	// Only respond to mentions or replies to the bot
	const isMention = message.mentions.has(botClient.user);
	const isReply = message.reference &&
		(await message.channel.messages.fetch(message.reference.messageId))
			.author.id === botClient.user.id;

	if (!isMention && !isReply) return;

	// Track user data
	const userId = message.author.id;
	const username = message.author.username;
	const timestamp = new Date().toISOString();

	// Connect to database
	const db = await getDatabase();
	const chatHistoryCollection = db.collection('openaiHistory');

	// Send typing indicator to show the bot is processing
	await message.channel.sendTyping();

	try {
		// Get chat history
		const history = await getChatHistory(userId, chatHistoryCollection);

		// Process user message
		const userMessage = {
			role: 'user',
			content: message.content,
			username,
			timestamp
		};

		// Update history with user message
		let updatedHistory = await updateChatHistory(userId, userMessage, chatHistoryCollection);

		// Check if explicit search is requested
		const searchCommand = processSearchCommand(message.content);
		if (searchCommand) {
			const results = await performSearch(searchCommand, message);
			if (results) return; // If search was handled, exit
		}

		// Check if message might need web search for context
		const needsSearch = await needsWebSearch(message.content);
		if (needsSearch) {
			const searchQuery = await extractSearchQuery(message.content);
			const results = await performWebSearch(searchQuery, userId, chatHistoryCollection, false);
			// We continue processing even after search - results are added to history
		}

		// Get the latest history with any search results included
		updatedHistory = await getChatHistory(userId, chatHistoryCollection);

		// Generate AI response
		const aiResponse = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				...updatedHistory,
				{
					role: 'system',
					content: `IMPORTANT: Your response MUST be 2000 characters or fewer to comply with Discord message limits. If your answer would be longer, condense it appropriately while maintaining the key information.`
				}
			],
		});

		// Extract reply content
		let replyContent = aiResponse.choices[0].message.content;

		// Enforce message length limit
		if (replyContent.length > MAX_DISCORD_MESSAGE_LENGTH) {
			console.log(`Response exceeded Discord character limit (${replyContent.length} chars). Truncating...`);

			// Try to get a shorter response instead of just truncating
			try {
				await message.channel.sendTyping();

				const condensedResponse = await openai.chat.completions.create({
					model: 'gpt-4o-mini',
					messages: [
						...updatedHistory,
						{
							role: 'assistant',
							content: replyContent
						},
						{
							role: 'system',
							content: 'Your previous response was too long for Discord (over 2000 characters). Please provide a condensed version that contains the most important information in under 2000 characters.'
						}
					],
				});

				replyContent = condensedResponse.choices[0].message.content;

				// If still too long after condensing, truncate with an indicator
				if (replyContent.length > MAX_DISCORD_MESSAGE_LENGTH) {
					replyContent = replyContent.substring(0, MAX_DISCORD_MESSAGE_LENGTH - 30) + '... [resposta truncada]';
				}
			} catch (condensingError) {
				console.error('Error condensing long message:', condensingError);
				// Fallback to simple truncation
				replyContent = replyContent.substring(0, MAX_DISCORD_MESSAGE_LENGTH - 30) + '... [resposta truncada]';
			}
		}

		// Send reply to user
		await message.reply(replyContent);

		// Update history with bot's reply
		await updateChatHistory(userId, {
			role: 'assistant',
			content: replyContent,
			username: botClient.user.username,
			timestamp: new Date().toISOString()
		}, chatHistoryCollection);

	} catch (error) {
		console.error('Error processing message:', error);
		await message.reply('Desculpa, tive um problema a processar a tua mensagem.');
	}
};

// Helper function to fetch chat history
async function getChatHistory(userId, collection) {
	const history = await collection.findOne({ userId });
	let messages = history?.messages || [];

	// Ensure system message is present and at the beginning
	const systemMessage = {
		role: 'system',
		content: 'You are a bot specialized in inline skating, speaking in European Portuguese (pt-PT) with a smart and sarcastic but playful attitude. Use humor and casual language, but avoid excessive swearing. Messages must be below 2000 characters. Always respond in European Portuguese. You can search the web for information when needed.'
	};

	// Remove any existing system messages
	messages = messages.filter(msg => msg.role !== 'system');

	// Add the system message at the beginning
	messages.unshift(systemMessage);

	return messages;
}

// Helper function to split long messages
function splitMessage(message, maxLength = MAX_DISCORD_MESSAGE_LENGTH) {
	if (message.length <= maxLength) return [message];

	const parts = [];
	let currentPart = '';

	// Split by sentences if possible
	const sentences = message.split(/(?<=[.!?])\s+/);

	for (const sentence of sentences) {
		// If adding this sentence would exceed max length, push current part and start a new one
		if (currentPart.length + sentence.length > maxLength) {
			if (currentPart.length > 0) {
				parts.push(currentPart);
				currentPart = '';
			}

			// If a single sentence is too long, we need to split it further
			if (sentence.length > maxLength) {
				// Split long sentence into chunks
				let remainingSentence = sentence;
				while (remainingSentence.length > 0) {
					const chunk = remainingSentence.substring(0, maxLength);
					parts.push(chunk);
					remainingSentence = remainingSentence.substring(maxLength);
				}
			} else {
				currentPart = sentence;
			}
		} else {
			currentPart += (currentPart.length > 0 ? ' ' : '') + sentence;
		}
	}

	// Push the last part if it's not empty
	if (currentPart.length > 0) {
		parts.push(currentPart);
	}

	// Add part indicators
	return parts.map((part, index) =>
		`${part}${parts.length > 1 ? ` [Parte ${index + 1}/${parts.length}]` : ''}`
	);
}

// Helper function to update chat history
async function updateChatHistory(userId, newMessage, collection) {
	const history = await getChatHistory(userId, collection);

	// Add the new message (system message is already handled in getChatHistory)
	const updatedHistory = history.filter(msg => msg.role !== 'system');
	updatedHistory.push(newMessage);

	// Cap at 10 most recent messages (excluding system message)
	const cappedHistory = updatedHistory.slice(-10);

	// Get system message
	const systemMessage = history.find(msg => msg.role === 'system');

	// Add system message back at the beginning
	cappedHistory.unshift(systemMessage);

	await collection.updateOne(
		{ userId },
		{ $set: { userId, messages: cappedHistory } },
		{ upsert: true }
	);

	return cappedHistory;
}

// Function to check if message has explicit search command
function processSearchCommand(messageContent) {
	const searchMatch = messageContent.match(/!search\s+(.*)/i);
	return searchMatch ? searchMatch[1] : null;
}

// Function to perform and respond to an explicit search command
async function performSearch(query, message) {
	try {
		await message.channel.sendTyping();
		const searchResults = await searchWeb(query);

		if (searchResults.length === 0) {
			await message.reply(`Não encontrei resultados para "${query}".`);
			return true;
		}

		// Format search results
		let resultText = `🔍 **Resultados para "${query}":**\n\n`;
		searchResults.forEach((result, index) => {
			resultText += `**${index + 1}. [${result.title}](${result.link})**\n${result.snippet}\n\n`;
		});

		// Check if result text is too long and split if needed
		if (resultText.length > MAX_DISCORD_MESSAGE_LENGTH) {
			const parts = splitMessage(resultText);
			for (const part of parts) {
				await message.reply(part);
			}
		} else {
			await message.reply(resultText);
		}

		return true;
	} catch (error) {
		console.error('Error in search command:', error);
		await message.reply('Desculpa, tive um problema a pesquisar na web.');
		return true;
	}
}

// Function to perform web search in the background
async function performWebSearch(query, userId, collection, sendDirect = false) {
	try {
		const searchResults = await searchWeb(query);

		if (searchResults.length > 0) {
			// Format results for the AI to use
			const formattedResults = searchResults.map(result =>
				`Title: ${result.title}\nLink: ${result.link}\nSummary: ${result.snippet}`
			).join('\n\n');

			// Add search results to history as a system message
			await updateChatHistory(userId, {
				role: 'system',
				content: `Aqui estão resultados de uma pesquisa na web para "${query}":\n\n${formattedResults}\n\nUse esta informação para responder ao utilizador em Português de Portugal.`
			}, collection);

			return searchResults;
		}
		return [];
	} catch (error) {
		console.error('Error in automatic web search:', error);
		return [];
	}
}

// Function to search the web using Google Custom Search API
async function searchWeb(query) {
	try {
		// Use Google Custom Search JSON API
		const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
			params: {
				key: process.env.GOOGLE_API_KEY,
				cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
				q: query,
				num: 5
			}
		});

		// Return first 3 results
		if (response.data && response.data.items) {
			return response.data.items.slice(0, 3).map(item => ({
				title: item.title,
				snippet: item.snippet,
				link: item.link
			}));
		} else {
			return [];
		}
	} catch (error) {
		console.error('Error searching the web:', error.message);

		// Log more detailed information for debugging
		if (error.response) {
			console.error('Error details:', {
				status: error.response.status,
				data: error.response.data
			});
		}

		// For API key issues, provide more helpful error
		if (error.response && error.response.status === 403) {
			console.error('API KEY ISSUE: Check your Google API key configuration');
		}

		throw new Error('Failed to search the web');
	}
}

// Function to analyze if a message needs web search
async function needsWebSearch(messageContent) {
	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: 'You are an analytical assistant. Your task is to determine if the user message likely requires recent information, facts, or data that would benefit from a web search. Respond only with "true" or "false".'
				},
				{
					role: 'user',
					content: messageContent
				}
			],
			temperature: 0.1,
			max_tokens: 10
		});

		const answer = response.choices[0].message.content.trim().toLowerCase();
		return answer === 'true';
	} catch (error) {
		console.error('Error analyzing message for web search need:', error);
		return false;
	}
}

// Function to extract search query from message
async function extractSearchQuery(messageContent) {
	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: 'Extract the most relevant search query from this message. Keep it concise, focused, and suitable for a web search. Just return the search query, nothing else.'
				},
				{
					role: 'user',
					content: messageContent
				}
			],
			temperature: 0.3,
			max_tokens: 50
		});

		return response.choices[0].message.content.trim();
	} catch (error) {
		console.error('Error extracting search query:', error);
		return messageContent;
	}
}
