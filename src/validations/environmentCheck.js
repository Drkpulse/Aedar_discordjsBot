const envManager = require('../helpers/envManager');

module.exports = async ({ interaction, commandObj }) => {
    const commandName = interaction.commandName;

    // Skip check for admin commands
    const adminCommands = ['togglecommand', 'commandstates'];
    if (adminCommands.includes(commandName)) {
        return false;
    }

    // Check if the command has all required environment variables
    if (!envManager.canCommandRun(commandName)) {
        const missingVars = envManager.getMissingEnvVarsForCommand(commandName);

        const missingVarsText = missingVars.join(', ');

        // Custom messages for specific environment variables
        const customMessages = {
            'OPENWEATHERMAP_API_KEY': 'Serviço meteorológico indisponível',
            'GIPHY_API': 'Serviço de GIFs indisponível',
            'VIRUSTOTAL_API_KEY': 'Serviço de verificação de vírus indisponível',
            // Add more custom messages as needed
        };

        // Get a custom message if available, otherwise use a generic one
        let errorMessage;
        if (missingVars.length === 1 && customMessages[missingVars[0]]) {
            errorMessage = customMessages[missingVars[0]];
        } else {
            errorMessage = `Este comando requer configuração adicional. Por favor, contacte um administrador.`;
        }

        interaction.reply({
            content: errorMessage,
            ephemeral: true
        });

        return true; // Halt command execution
    }

    return false; // Continue command execution
};
