import { OpenAI } from 'openai';
import { getDatabase } from '../../../helpers/mongoClient.js';
import axios from 'axios'; // For web searches

// Only create the OpenAI client when a key is set, so the bot still starts without one.
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Constants
const MAX_DISCORD_MESSAGE_LENGTH = 2000;
const HISTORY_LIMIT = 10;
const PERSONA_MESSAGE = {
	role: 'system',
	content: 'You are a bot specialized in inline skating, speaking in European Portuguese (pt-PT) with a smart and sarcastic but playful attitude. Use humor and casual language, but avoid excessive swearing. Messages must be below 2000 characters. Always respond in European Portuguese. You can search the web for information when needed.'
};

export default async (message, botClient) => {
	// Ignore bot messages, and do nothing without an OpenAI key
	if (message.author.bot || !openai) return;

	// Only respond to mentions or replies to the bot.
	// A deleted or inaccessible reference must not stop an explicit mention.
	const isMention = message.mentions.has(botClient.user);
	let referencedMessage = null;
	if (message.reference?.messageId) {
		try {
			referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
		} catch (error) {
			console.warn('Could not fetch referenced message:', error.message);
		}
	}
	const isReply = referencedMessage?.author.id === botClient.user.id;

	if (!isMention && !isReply) return;

	// Check if message is already in a thread
	const isInThread = message.channel.isThread();

	// Track user and thread data
	const userId = message.author.id;
	const username = message.author.username;
	const timestamp = new Date().toISOString();
	// Use thread ID as conversation ID if in a thread, otherwise use user ID
	const conversationId = isInThread ? message.channel.id : userId;

	// Connect to database
	const db = await getDatabase();
	const chatHistoryCollection = db.collection('openaiHistory');

	// Send typing indicator to show the bot is processing
	await message.channel.sendTyping();

	try {
		// Explicit search command: answer with the results directly
		const searchCommand = processSearchCommand(message.content);
		if (searchCommand) {
			const handled = await performSearch(searchCommand, message);
			if (handled) return;
		}

		// Get chat history for this specific conversation (thread or user)
		const history = await getChatHistory(conversationId, chatHistoryCollection);

		// Messages this turn adds to the conversation
		const newMessages = [];

		// Include the bot message being replied to when it is not already in context
		if (isReply && referencedMessage.content &&
			!history.some(msg => msg.role === 'assistant' && msg.content === referencedMessage.content)) {
			newMessages.push({
				role: 'assistant',
				content: referencedMessage.content,
				username: botClient.user.username,
				timestamp: referencedMessage.createdAt.toISOString()
			});
		}

		const userMessage = {
			role: 'user',
			content: message.content,
			username,
			timestamp
		};
		newMessages.push(userMessage);

		// Check if message might need web search for context.
		// Results are passed straight to the model and are not stored.
		const contextMessages = [];
		const needsSearch = await needsWebSearch(message.content);
		if (needsSearch) {
			const searchQuery = await extractSearchQuery(message.content);
			const searchContext = await performWebSearch(searchQuery);
			if (searchContext) contextMessages.push(searchContext);
		}

		const conversation = [...history, ...newMessages];
		const requestMessages = [
			PERSONA_MESSAGE,
			...toOpenAIMessages(conversation),
			...contextMessages,
			{
				role: 'system',
				content: `IMPORTANT: Your response MUST be 2000 characters or fewer to comply with Discord message limits. If your answer would be longer, condense it appropriately while maintaining the key information.`
			}
		];

		// Generate AI response
		const aiResponse = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: requestMessages,
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
						...requestMessages,
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

		const assistantMessage = {
			role: 'assistant',
			content: replyContent,
			username: botClient.user.username,
			timestamp: new Date().toISOString()
		};
		const turn = [...newMessages, assistantMessage];

		// Create thread if not already in one
		if (!isInThread) {
			let thread = null;
			try {
				// Generate a thread name based on the user's message
				const threadName = await generateThreadName(message.content);

				// Create a thread directly from the user's message
				thread = await message.startThread({
					name: threadName.substring(0, 100), // Discord thread names are limited to 100 chars
					autoArchiveDuration: 1440 // Archive after 24 hours (in minutes)
				});
			} catch (threadError) {
				console.error('Error creating thread:', threadError);
			}

			if (thread) {
				// Seed the thread with the context used for this answer, including the opening question
				await appendChatHistory(thread.id, [...history, ...turn], chatHistoryCollection);
				await thread.send(replyContent);
			} else {
				// Fallback to regular reply if thread creation fails
				await message.reply(replyContent);
			}
			await appendChatHistory(userId, turn, chatHistoryCollection);
		} else {
			// Standard reply in existing thread
			await message.reply(replyContent);
			await appendChatHistory(message.channel.id, turn, chatHistoryCollection);
		}

	} catch (error) {
		console.error('Error processing message:', error);
		await message.reply('Desculpa, tive um problema a processar a tua mensagem.');
	}
};

// Fetch the stored conversation (without system messages).
// Histories saved before threads were keyed only by userId; adopt them on first read.
async function getChatHistory(conversationId, collection) {
	let history = await collection.findOne({ conversationId });

	if (!history) {
		const legacy = await collection.findOne({ userId: conversationId, conversationId: { $exists: false } });
		if (legacy) {
			await collection.updateOne({ _id: legacy._id }, { $set: { conversationId } });
			history = legacy;
		}
	}

	return (history?.messages || []).filter(msg => msg.role !== 'system');
}

// Append messages atomically and keep only the most recent ones
async function appendChatHistory(conversationId, newMessages, collection) {
	await collection.updateOne(
		{ conversationId },
		{ $push: { messages: { $each: newMessages, $slice: -HISTORY_LIMIT } } },
		{ upsert: true }
	);
}

// OpenAI only needs role and content
function toOpenAIMessages(messages) {
	return messages.map(({ role, content }) => ({ role, content }));
}

// Helper function to split long messages
function splitMessage(message, maxLength = MAX_DISCORD_MESSAGE_LENGTH) {
	if (message.length <= maxLength) return [message];

	// Leave room for the " [Parte X/Y]" label added to each part
	const labelRoom = 20;
	const limit = maxLength - labelRoom;
	const parts = [];
	let currentPart = '';

	// Split by sentences if possible
	const sentences = message.split(/(?<=[.!?])\s+/);

	for (const sentence of sentences) {
		const separator = currentPart.length > 0 ? ' ' : '';

		// If adding this sentence would exceed the limit, push current part and start a new one
		if (currentPart.length + separator.length + sentence.length > limit) {
			if (currentPart.length > 0) {
				parts.push(currentPart);
				currentPart = '';
			}

			// If a single sentence is too long, split it into fixed-size chunks
			if (sentence.length > limit) {
				for (let i = 0; i < sentence.length; i += limit) {
					parts.push(sentence.substring(i, i + limit));
				}
			} else {
				currentPart = sentence;
			}
		} else {
			currentPart += separator + sentence;
		}
	}

	// Push the last part if it's not empty
	if (currentPart.length > 0) {
		parts.push(currentPart);
	}

	// Add part indicators
	return parts.map((part, index) => `${part} [Parte ${index + 1}/${parts.length}]`);
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

// Search the web in the background and return a context message for the model (or null)
async function performWebSearch(query) {
	try {
		const searchResults = await searchWeb(query);

		if (searchResults.length === 0) return null;

		// Format results for the AI to use
		const formattedResults = searchResults.map(result =>
			`Title: ${result.title}\nLink: ${result.link}\nSummary: ${result.snippet}`
		).join('\n\n');

		return {
			role: 'system',
			content: `Aqui estão resultados de uma pesquisa na web para "${query}":\n\n${formattedResults}\n\nUse esta informação para responder ao utilizador em Português de Portugal.`
		};
	} catch (error) {
		console.error('Error in automatic web search:', error);
		return null;
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

// Function to generate a thread name based on the message content
async function generateThreadName(messageContent) {
	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: 'Create a concise, descriptive thread name (max 5 words) based on this message content. Respond with only the thread name, nothing else. The thread name should be in European Portuguese (pt-PT).'
				},
				{
					role: 'user',
					content: messageContent
				}
			],
			temperature: 0.7,
			max_tokens: 30
		});

		return response.choices[0].message.content.trim();
	} catch (error) {
		console.error('Error generating thread name:', error);
		return 'Conversa com IA'; // Default thread name if generation fails
	}
}
