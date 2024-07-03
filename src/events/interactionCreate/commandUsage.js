
module.exports = async (interaction, io) => {
	if (!interaction.isCommand()) return;

	const dateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
	const user = interaction.user.tag;
	const interactionId = interaction.commandName;

	console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
};
