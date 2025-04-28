const { exec } = require('child_process');
const path = require('path');

module.exports = {
    data: {
        name: 'botupdate',
        description: 'Updates the bot from Git repository and restarts it',
    },

    run: async ({ interaction, client }) => {
        await interaction.deferReply({ ephemeral: true });

        // Get the correct path to the bash script
        const scriptPath = path.join(__dirname, '..', '..', 'upbot.sh');

        // Make the script executable
        exec(`chmod +x ${scriptPath}`, (chmodError) => {
            if (chmodError) {
                console.error(`Error making script executable: ${chmodError}`);
                return interaction.followUp('Error making update script executable');
            }

            // Execute the bash script
            exec(scriptPath, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return interaction.followUp(`Error updating the repository: ${error.message}`);
                }

                if (stderr && !stderr.includes('Debugger attached')) {
                    console.error(`Warning: ${stderr}`);
                }

                console.log(`Update output: ${stdout}`);

                interaction.followUp({
                    content: 'Bot update initiated successfully! The bot will restart momentarily.',
                    ephemeral: true
                });

                // Gracefully exit after a short delay to allow the message to be sent
                setTimeout(() => {
                    console.log('Bot is restarting after update...');
                    process.exit(0); // Process will be restarted by your process manager (PM2, nodemon, etc.)
                }, 2000);
            });
        });
    },
    options: {
        devOnly: true,
    },
};
