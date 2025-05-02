require('dotenv').config();
const { getDatabase } = require('../ready/mongoClient');

module.exports = async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;
  const username = message.author.username;
  const content = message.content.toLowerCase();
  const channelId = message.channel.id;
  const channelName = message.channel.name;
  const timestamp = new Date().toISOString();
  const messageId = message.id;
  const messageType = message.attachments.size > 0 ? 'attachment' : 'text';
  const attachments = message.attachments.map(att => att.url); // Collect attachment URLs
  const mentions = message.mentions.users.map(user => user.id); // Collect mentioned users
  const isEdited = message.editedTimestamp !== null; // Check if the message is edited
  const editTimestamp = isEdited ? message.editedTimestamp.toISOString() : null; // Get edit timestamp
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
	// Add the new message to history without capping
	await chatHistoryCollection.updateOne(
	  { userId },
	  { $push: { messages: newMessage } },
	  { upsert: true }
	);
  };

  // Fetch current history and update with user's message
  const userMessage = {
	role: 'user',
	content,
	username,
	timestamp,
	channelId,
	channelName,
	messageId,
	messageType,
	attachments,
	mentions,
	isEdited,
	editTimestamp,
	serverId,
  };

  await updateChatHistory(userId, userMessage);

  // Optionally, fetch and log the user's chat history
  const history = await getChatHistory(userId);
  console.log('Chat history for user:', userId, history);
};