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
  const replyToId = message.reference ? message.reference.messageId : null; // Track if message is a reply

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

  // Update operations to perform
  const updateOperations = {
    // Always update username to have the most recent one
    $set: { username },
    // Increment message count
    $inc: { messageCount: 1 }
  };

  // Only add to conversation history if it's a reply
  if (replyToId) {
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
    console.log(`Added reply message to conversation history, replying to message ID: ${replyToId}`);
  }
};
