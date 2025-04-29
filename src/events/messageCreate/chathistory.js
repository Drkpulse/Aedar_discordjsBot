require('dotenv').config();
const { getDatabase } = require('../../helpers/mongoClient');
const crypto = require('crypto');

module.exports = async (message) => {
  if (message.author.bot) return;

  // Check for user consent (implement actual logic here)
  const userConsent = true; // Replace with actual consent logic
  if (!userConsent) {
	console.warn('User has not given consent for data logging.');
	return;
  }

  const originalUserId = message.author.id;

  // Generate a random salt and hash the userId
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedUserId = crypto.createHash('sha256').update(salt + originalUserId).digest('hex');

  // Round the timestamp to the nearest half-hour
  const now = new Date();
  const roundedMinutes = Math.round(now.getMinutes() / 30) * 30;
  now.setMinutes(roundedMinutes, 0, 0);
  const time = now.toTimeString().split(' ')[0]; // Only store HH:MM:SS

  const channelId = message.channel.id;
  const serverId = message.guild ? message.guild.id : null; // Get server ID if applicable

  // Get MongoDB instance and collection
  const db = await getDatabase();
  const chatHistoryCollection = db.collection('chatHistory');

  // Helper function to fetch chat history from MongoDB
  const getChatHistory = async (userId) => {
	const history = await chatHistoryCollection.findOne({ userId });
	return history?.messages || [];
  };

  // Helper function to update chat history in MongoDB
  const updateChatHistory = async (userId, newMessage) => {
	await chatHistoryCollection.updateOne(
	  { userId },
	  { $push: { messages: newMessage } },
	  { upsert: true }
	);
  };

  // Prepare the minimal metadata for logging
  const userMessage = {
	time,                 // Only rounded time
	channelId,            // Channel ID
	serverId,             // Server ID
	salt,                 // Store the salt for verification
  };

  // Save hashed user ID and minimal message metadata
  await updateChatHistory(hashedUserId, userMessage);

  // Optionally, fetch and log the user's chat history
  const history = await getChatHistory(hashedUserId);
  console.log('Updated chat history:', history);
};
