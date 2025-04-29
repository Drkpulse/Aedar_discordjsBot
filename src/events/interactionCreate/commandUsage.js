<<<<<<< Updated upstream
const { getDatabase } = require('../../helpers/mongoClient');
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
=======
const { getDatabase } = require('../../helpers/mongoClient');
const crypto = require('crypto');

module.exports = async (interaction, io) => {
  if (!interaction.isCommand()) return;

  // Generate the current hour rounded to the nearest half-hour
  const now = new Date();
  const roundedMinutes = Math.round(now.getMinutes() / 30) * 30;
  now.setMinutes(roundedMinutes, 0, 0);
  const time = now.toTimeString().split(' ')[0]; // Keep only the time (HH:MM:SS)

  const userId = interaction.user.id; // Original user ID

  // Generate a random salt and hash the user ID
  const salt = crypto.randomBytes(16).toString('hex'); // 16 bytes of random data
  const hashedUserId = crypto.createHash('sha256').update(salt + userId).digest('hex');

  const interactionId = interaction.commandName;
  const channelId = interaction.channelId;
  const serverId = interaction.guildId || null;

  console.log(`[${time}] Interaction: ${interactionId}`);

  // Check for user consent (implement this based on your application logic)
  const userConsent = true; // Replace with actual consent logic

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
      userId: hashedUserId, // Store only hashed user ID
      salt,                 // Store the salt for future verification if needed
      interactionId,
      channelId,
      serverId,
      time,                 // Store only the rounded time
    };

    await interactionLogsCollection.insertOne(interactionLog);
    console.log('Interaction logged in database:', interactionLog);
  } catch (error) {
    console.error('Error logging interaction in database:', error);
  }
};
>>>>>>> Stashed changes
