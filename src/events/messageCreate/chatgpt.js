require('dotenv').config();
const { OpenAI } = require('openai');
const { MongoClient } = require('mongodb');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MongoDB setup
const client = new MongoClient(process.env.MONGO_URI); // Replace with your MongoDB URI
let chatHistoryCollection;

// Connect to MongoDB
client.connect()
  .then(() => {
    const db = client.db('chatbot');
    chatHistoryCollection = db.collection('chatHistory');
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

module.exports = async (message, botClient) => {
  if (message.author.bot) return;

  const userId = message.author.id;
  const username = message.author.username;
  const content = message.content.toLowerCase();
  const channelId = message.channel.id;
  const channelName = message.channel.name;
  const timestamp = new Date().toISOString();

  // Helper function to fetch chat history from MongoDB
  const getChatHistory = async (userId) => {
    const history = await chatHistoryCollection.findOne({ userId });
    return history?.messages || [];
  };

  // Helper function to update chat history in MongoDB
  const updateChatHistory = async (userId, newMessage) => {
    const history = await getChatHistory(userId);

    // Add the new message to history, capping at 10 messages
    const updatedHistory = [...history, newMessage].slice(-10);

    await chatHistoryCollection.updateOne(
      { userId },
      { $set: { userId, messages: updatedHistory } },
      { upsert: true }
    );

    return updatedHistory;
  };

  // Check if it's the user's first interaction
  let history = await getChatHistory(userId);
  if (history.length === 0) {
    // If it's the first interaction, send a system message to GPT
    const systemMessage = { role: 'system', content: 'You are a bot specialized in inline skating, speaking in European Portuguese (pt-PT) with a smart language and sarcastic but playful attitude. Use humor and casual language, but avoid excessive swearing. Messages must be below 2000 characters.' };
    history = await updateChatHistory(userId, systemMessage);
  }

  // Fetch current history and update with user's message
  const userMessage = {
    role: 'user',
    content: message.content,
    username,
    timestamp,
    channelId,
    channelName
  };
  history = await updateChatHistory(userId, userMessage);

  // Handle replies to bot messages
  if (message.reference) {
    try {
      const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);

      if (referencedMessage.author.id === botClient.user.id) {
        const botMessage = {
          role: 'assistant',
          content: referencedMessage.content,
          username: botClient.user.username,
          timestamp: referencedMessage.createdAt.toISOString(),
          channelId,
          channelName
        };
        history = await updateChatHistory(userId, botMessage);

        // Simulate typing
        await message.channel.sendTyping();

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini', // or 'gpt-3.5-turbo'
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
          channelId,
          channelName
        };
        await updateChatHistory(userId, botReplyMessage);

        return; // Exit to prevent further processing
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
      // Simulate typing
      await message.channel.sendTyping();

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // or 'gpt-3.5-turbo'
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
        channelId,
        channelName
      };
      await updateChatHistory(userId, botReplyMessage);
    } catch (error) {
      console.error('Error communicating with OpenAI:', error);
      message.reply('Sorry, I encountered an error while processing your request.');
    }
  }
};
