const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config(); // Load environment variables from .env file

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Add your OpenAI API key

// Initialize OpenAI API
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = async (message, client) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Convert the message content to lowercase for case-insensitive matching
  const content = message.content.toLowerCase();

  // Check if the message is a reply to the bot's message
  if (message.reference) {
    try {
      // Fetch the message being replied to
      const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);

      // Check if the referenced message was sent by the bot
      if (referencedMessage.author.id === client.user.id) {
        // Prepare messages for ChatGPT
        const messages = [
          { role: 'user', content: referencedMessage.content }, // Original message
          { role: 'user', content: message.content } // Reply
        ];

        // Use ChatGPT to respond to the reply with context
        const response = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo', // or 'gpt-4' if you have access
          messages: messages,
        });

        const reply = response.data.choices[0].message.content;
        message.reply(reply);
      }
    } catch (error) {
      console.error('Error fetching referenced message or communicating with OpenAI:', error);
      message.reply('Sorry, I encountered an error while processing your request.');
    }
  }

  // Respond using ChatGPT when the bot is mentioned or a command is used
  if (message.mentions.has(client.user)) {
    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo', // or 'gpt-4' if you have access
        messages: [{ role: 'user', content: message.content }],
      });

      const reply = response.data.choices[0].message.content;
      message.reply(reply);
    } catch (error) {
      console.error('Error communicating with OpenAI:', error);
      message.reply('Sorry, I encountered an error while processing your request.');
    }
  }
};
