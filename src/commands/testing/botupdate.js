
const { exec } = require('child_process');

module.exports = {
	data:{
		name: 'botupdate',
		description: 'Update the Git repository and start nodemon',
	},



	run: async ({interaction, client}) => {
		// Execute the bash script
		exec('~/Aedar_discordjsBot/src/upbot.sh', (error, stdout, stderr) => {
			if (error) {
				console.error(`Error: ${error.message}`);
				interaction.reply('Error updating the repository.');
				return;
			}
			if (stderr) {
				console.error(`Error: ${stderr}`);
				interaction.reply('Error updating the repository.');
				return;
			}
			console.log(`Script output: ${stdout}`);
			interaction.reply('Repository updated successfully and nodemon started.');
		});
		// Log command usage
        const dateTime = new Date().toISOString();
        const user = interaction.user.tag;
        const interactionId = interaction.commandName;

        console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
	},
	options: {
		devOnly: true,
		//userPermissions: [],
		//botPermissions: [],
		//deleted: false,
	},
};

