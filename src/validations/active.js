const { isCommandActive } = require('../helpers/commandManager');

module.exports = ({ interaction, commandObj }) => {
    const commandName = interaction.commandName;
    const guildId = interaction.guild?.id;

    // Check if the command is active from all sources:
    // 1. The command object's options
    // 2. The command manager's global state
    // 3. The server-specific state (if in a guild)
    if (commandObj.options?.isActive === false || !isCommandActive(commandName, guildId)) {
        const inactiveMessages = [
            "Este comando está atualmente desativado. Tente novamente mais tarde!",
            "Desculpe, mas este comando não está disponível no momento.",
            "Este comando está em manutenção. Por favor, aguarde!",
            "Oops! Este comando foi colocado em modo de espera.",
            "Este comando está fora de serviço. Tente outro!",
            "Desculpe, mas o bot está a fazer algumas atualizações e este comando não está ativo.",
            "Este comando está temporariamente desativado. Volte mais tarde!",
            "Este comando está a descansar. Tente novamente mais tarde!"
        ];

        // Select a random inactive message
        const randomMessage = inactiveMessages[Math.floor(Math.random() * inactiveMessages.length)];

        interaction.reply({ content: randomMessage, ephemeral: true });
        return true; // Indicate that the command execution should be halted
    }

    return false; // Command is active, continue execution
};
