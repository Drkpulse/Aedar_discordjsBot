const { getDatabase } = require('../ready/mongoClient');
const crypto = require('crypto');

module.exports = async (interaction, io) => {
  if (!interaction.isCommand()) return;

  const dateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
  const user = interaction.user.tag;
  const userId = interaction.user.id; // Original user ID

  // Generate a random salt
  const salt = crypto.randomBytes(16).toString('hex'); // 16 bytes of random data
  const hashedUserId = crypto.createHash('sha256').update(salt + userId).digest('hex'); // Hashing the user ID with salt

  const interactionId = interaction.commandName;
  const channelId = interaction.channelId;
  const serverId = interaction.guildId || null;

  console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);

  // Check for user consent (this should be implemented in your application logic)
  const userConsent = true; // Replace with actual consent check

  if (!userConsent) {
    console.warn('User has not given consent for data logging.');
    return;
  }

  try {
    // Get MongoDB instance and collection
    const db = await getDatabase();
    const interactionLogsCollection = db.collection('interactionLogs');

    // Log interaction in MongoDB
    const interactionLog = {
      user,
      userId: hashedUserId, // Store the hashed user ID
      salt, // Store the salt for future verification if needed
      interactionId,
      channelId,
      serverId,
      dateTime,
    };

    await interactionLogsCollection.insertOne(interactionLog);
    console.log('Interaction logged in database:', interactionLog);
  } catch (error) {
    console.error('Error logging interaction in database:', error);
  }
};
