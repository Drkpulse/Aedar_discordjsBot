require('dotenv').config();
const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (message, client) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  if (message.reference) {
    try {
      const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);

      if (referencedMessage.author.id === client.user.id) {
        const messages = [
          { role: 'user', content: referencedMessage.content },
          { role: 'user', content: message.content },
        ];

        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages,
        });

        const reply = response.choices[0].message.content;
        message.reply(reply);
      }
    } catch (error) {
      console.error('Error fetching referenced message or communicating with OpenAI:', error);
      message.reply('Sorry, I encountered an error while processing your request.');
    }
  }

  if (message.mentions.has(client.user)) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message.content }],
      });

      const reply = response.choices[0].message.content;
      message.reply(reply);
    } catch (error) {
      console.error('Error communicating with OpenAI:', error);
      message.reply('Sorry, I encountered an error while processing your request.');
    }
  }
};
