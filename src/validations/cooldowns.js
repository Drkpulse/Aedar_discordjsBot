const cooldownManager = require('../helpers/cooldownManager');

module.exports = ({ interaction, commandObj }) => {
	// Check if the command has a cooldown specified
	if (commandObj.options?.cooldown) {
		const commandName = commandObj.data.name;

		// Check if the user is on cooldown for this command
		const remainingCooldown = cooldownManager.getRemainingCooldown(interaction.user.id, commandName);
		if (remainingCooldown > 0) {
			const remainingSeconds = Math.ceil(remainingCooldown / 1000);
			const hours = Math.floor(remainingSeconds / 3600);
			const minutes = Math.floor((remainingSeconds % 3600) / 60);
			const seconds = remainingSeconds % 60;

			let remainingTimeStr = '';
			if (hours > 0) {
				remainingTimeStr += `${hours} hour${hours > 1 ? 's' : ''}`;
			}
			if (minutes > 0) {
				remainingTimeStr += `${remainingTimeStr ? ', ' : ''}${minutes} minute${minutes > 1 ? 's' : ''}`;
			}
			if (seconds > 0) {
				remainingTimeStr += `${remainingTimeStr ? ', ' : ''}${seconds} second${seconds > 1 ? 's' : ''}`;
			}

			const funnyMessages = [
				"O bot precisa de uma pausa! Está a fazer horas extra...",
				"Calma! O bot está na pausa.",
				"Ops! Parece que o bot está a fazer greve.",
				"Atentação até o bot precisa de intervalos.",
				"Estás a ir rápido demais, a policia do discord ainda te apanha",
				"Parece que o bot foi para um retiro espiritual!",
				"O bot está a recarregar as baterias, por favor aguarde...",
				"Atenção: o bot entrou em modo de poupança de bateria!",
				"O bot está a fazer yoga, precisa de um momento de zen.",
				"Desculpa, o bot está a fazer uma maratona de séries!",
				"O bot saiu para tomar um café, mas já volta!",
				"Parece que o bot está a fazer uma pausa para o lanche.",
				"O bot foi dar uma volta no parque, precisa de ar fresco.",
				"Atenção: o bot está a meditar, silêncio, por favor!",
				"O bot está a fazer uma pausa dramática, não interrompa!"
			];

			// Select a random funny message
			const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

			interaction.reply({ content: `${randomMessage} Tens de esperar: ${remainingTimeStr}.`, ephemeral: true });

			return true; // Indicate that the command execution should be halted
		} else {
			// User is not on cooldown, proceed with executing the command
			// Update the cooldown manager to mark the user as on cooldown for this command
			cooldownManager.setCooldown(interaction.user.id, commandName, commandObj.options.cooldown);
			return false; // Proceed with executing the command
		}
	} else {
		// No cooldown specified for this command, proceed with executing the command
		return false;
	}
};


