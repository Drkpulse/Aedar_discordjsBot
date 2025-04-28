const commandStateManager = require('../helpers/commandStateManager');

module.exports = async ({ interaction, commandObj }) => {
    // Check if the command has been explicitly disabled
    if (commandObj.options?.isActive === false) {
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

    // Check if the command has been dynamically disabled
    const commandName = interaction.commandName;
    const isActive = await commandStateManager.getCommandState(commandName);

    if (!isActive) {
        const inactiveMessages = [
            "Este comando está temporariamente desativado pelos administradores.",
            "Este comando foi desativado. Tente novamente mais tarde!",
            "Um administrador desativou este comando. Por favor, aguarde até que seja reativado."
        ];

        const randomMessage = inactiveMessages[Math.floor(Math.random() * inactiveMessages.length)];

        interaction.reply({ content: randomMessage, ephemeral: true });
        return true;
    }

    return false;
};
