const { getDatabase } = require('../ready/mongoClient');

module.exports = async (interaction, io) => {
  if (!interaction.isCommand()) return;

  const dateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
  const user = interaction.user.tag;
  const userId = interaction.user.id;
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
	  userId,
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