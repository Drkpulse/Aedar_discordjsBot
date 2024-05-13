const { SlashCommandBuilder } = require('@discordjs/builders');
const { readdirSync } = require('fs');
const { join } = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays information about available commands'),

    run: async ({ interaction, client }) => {
        const commandFiles = getAllCommandFiles(join(__dirname, '..', 'commands'));
        const commands = commandFiles.map(file => require(file));

        // Format command data into a readable format
        const helpText = commands.map(command => {
            return `**/${command.data.name}**: ${command.data.description}`;
        }).join('\n');

        // Send the help text as a reply to the user
        await interaction.reply({ content: `**Available Commands:**\n${helpText}`, ephemeral: true });
    },
    options: {
        devOnly: true,
        userPermissions: [],
        botPermissions: [],
        deleted: false,
    },
};

// Function to recursively get all command files in the commands directory
function getAllCommandFiles(dir) {
    const commandFiles = [];
    const files = readdirSync(dir);
    for (const file of files) {
        const filePath = join(dir, file);
        const stat = lstatSync(filePath);
        if (stat.isDirectory()) {
            const subDirFiles = getAllCommandFiles(filePath);
            commandFiles.push(...subDirFiles);
        } else if (file.endsWith('.js')) {
            commandFiles.push(filePath);
        }
    }
    return commandFiles;
}
