require('dotenv').config();
const { getDatabase } = require('../../helpers/mongoClient');

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
  const attachments = message.attachments.map(att => att.url);
  const mentions = message.mentions.users.map(user => user.id);
  const isEdited = message.editedTimestamp !== null;
  const editTimestamp = isEdited ? message.editedTimestamp.toISOString() : null;
  const serverId = message.guild ? message.guild.id : null;
  const replyToId = message.reference ? message.reference.messageId : null;

  // Get MongoDB instance and collection
  const db = await getDatabase();
  const chatHistoryCollection = db.collection('chatHistory');

  // Helper function to fetch user data from MongoDB
  const getUserData = async (userId) => {
	const userData = await chatHistoryCollection.findOne({ userId });
	return {
	  username: userData?.username || username,
	  messageCount: userData?.messageCount || 0,
	  conversationHistory: userData?.conversationHistory || []
	};
  };

  // Fetch current user data
  const userData = await getUserData(userId);

  // Create the new message object
  const userMessage = {
	messageId,
	content,
	timestamp,
	channelId,
	channelName,
	messageType,
	attachments,
	mentions,
	isEdited,
	editTimestamp,
	serverId,
	replyToId
  };

  // Base update operations - always count messages and update username
  const updateOperations = {
	$set: { username },
	$inc: { messageCount: 1 }
  };

  // Add to conversation history if it's a reply or contains mentions
  if (replyToId || mentions.length > 0) {
	updateOperations.$push = {
	  conversationHistory: {
		$each: [userMessage],
		$slice: -50 // Keep only last 50 conversation messages
	  }
	};
  }

  // Update user data in MongoDB
  await chatHistoryCollection.updateOne(
	{ userId },
	updateOperations,
	{ upsert: true }
  );

  // Log information for debugging
  console.log(`Message logged for ${username} (ID: ${userId}), total messages: ${userData.messageCount + 1}`);
  if (replyToId) {
	console.log(`Added message to conversation history (reply to ${replyToId})`);
  } else if (mentions.length > 0) {
	console.log(`Added message to conversation history (contains ${mentions.length} mention(s))`);
  } else {
	console.log(`Message counted but not saved to history (not a reply or mention)`);
  }
};
