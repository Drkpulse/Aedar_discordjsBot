const { exec } = require('child_process');
const path = require('path');

module.exports = {
	data: {
		name: 'botupdate',
		description: 'Update the Git repository and start nodemon',
	},

	run: async ({ interaction, client }) => {
		// Define the path to the bash script
		const scriptPath = path.join(__dirname, 'src', 'upbot.sh'); // Adjust this path as necessary

		// Execute the bash script
		exec(scriptPath, (error, stdout, stderr) => {
			if (error) {
				console.error(`Error: ${error.message}`);
				interaction.reply('Error updating the repository: ' + error.message);
				return;
			}
			if (stderr) {
				console.error(`Error: ${stderr}`);
				interaction.reply('Error updating the repository: ' + stderr);
				return;
			}
			console.log(`Script output: ${stdout}`);
			interaction.reply('Repository updated successfully and nodemon started.');
		});
	},
	options: {
		devOnly: true,
	},
};
