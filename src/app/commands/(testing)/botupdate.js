import { execFile } from 'child_process';
import path from 'path';
import { DEV_GUILD_IDS } from '../../../helpers/devConfig.js';

export const command = {
	name: 'botupdate',
	description: 'Update the Git repository and start nodemon',
};

export const chatInput = async ({ interaction, client }) => {
	// Define the path to the bash script
	const scriptPath = path.join(process.cwd(), 'src', 'upbot.sh');

	// Execute the bash script without shell interpolation
	execFile('bash', [scriptPath], (error, stdout, stderr) => {
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
};

export const options = {
	devOnly: true,
};

export const metadata = {
	guilds: DEV_GUILD_IDS,
};
