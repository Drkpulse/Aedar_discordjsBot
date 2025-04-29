require('dotenv').config();
const { OpenAI } = require('openai');
const { getDatabase } = require('../../helpers/mongoClient');

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (message, botClient) => {
	if (message.author.bot) return;

	const userId = message.author.id;
	const username = message.author.username;
	const timestamp = new Date().toISOString();

	// Fetch the collection using the centralized MongoDB setup
	const db = await getDatabase();
	const chatHistoryCollection = db.collection('openaiHistory');

	// Helper function to fetch chat history
	const getChatHistory = async (userId) => {
		const history = await chatHistoryCollection.findOne({ userId });
		return history?.messages || [];
	};

	// Helper function to update chat history
	const updateChatHistory = async (userId, newMessage) => {
		const history = await getChatHistory(userId);

		// System message (if not already present)
		const systemMessage = {
			role: 'system',
			content:
				'You are a bot specialized in inline skating, speaking in European Portuguese (pt-PT) with a smart and sarcastic but playful attitude. Use humor and casual language, but avoid excessive swearing. Messages must be below 2000 characters.',
		};
		if (!history.some(msg => msg.role === 'system' && msg.content === systemMessage.content)) {
			history.unshift(systemMessage); // Add system message at the beginning
		}

		// Add the new message to history, capping at 10 messages
		const updatedHistory = [...history, newMessage].slice(-10);

		await chatHistoryCollection.updateOne(
			{ userId },
			{ $set: { userId, messages: updatedHistory } },
			{ upsert: true }
		);

		return updatedHistory;
	};

	// Get existing chat history
	let history = await getChatHistory(userId);

	// Handle replies to bot messages
	if (message.reference) {
		try {
			const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);

			if (referencedMessage.author.id === botClient.user.id) {
				// Add user message to history
				const userMessage = { role: 'user', content: message.content, username, timestamp };
				history = await updateChatHistory(userId, userMessage);

				// Add the referenced bot message to history
				const botMessage = {
					role: 'assistant',
					content: referencedMessage.content,
					username: botClient.user.username,
					timestamp: referencedMessage.createdAt.toISOString(),
				};
				history = await updateChatHistory(userId, botMessage);

				// Simulate typing
				await message.channel.sendTyping();

				const response = await openai.chat.completions.create({
					model: 'gpt-4o-mini',
					messages: history,
				});

				const reply = response.choices[0].message.content;
				await message.reply(reply);

				// Update history with bot's reply
				const botReplyMessage = {
					role: 'assistant',
					content: reply,
					username: botClient.user.username,
					timestamp: new Date().toISOString(),
				};
				await updateChatHistory(userId, botReplyMessage);

				return;
			}
		} catch (error) {
			console.error('Error fetching referenced message or communicating with OpenAI:', error);
			message.reply('Sorry, I encountered an error while processing your request.');
			return; // Exit on error
		}
	}

	// Handle mentions
	if (message.mentions.has(botClient.user)) {
		try {
			// Add user message to history only for mentions
			const userMessage = { role: 'user', content: message.content, username, timestamp };
			history = await updateChatHistory(userId, userMessage);

			// Simulate typing
			await message.channel.sendTyping();

			const response = await openai.chat.completions.create({
				model: 'gpt-4o-mini',
				messages: history,
			});

			const reply = response.choices[0].message.content;
			await message.reply(reply);

			// Update history with bot's reply
			const botReplyMessage = {
				role: 'assistant',
				content: reply,
				username: botClient.user.username,
				timestamp: new Date().toISOString()
			};
			await updateChatHistory(userId, botReplyMessage);
		} catch (error) {
			console.error('Error communicating with OpenAI:', error);
			message.reply('Sorry, I encountered an error while processing your request.');
		}
	}
};
