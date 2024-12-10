const cooldowns = require('../../validations/cooldowns');
const createEconomyManager = require('../../helpers/economyManager');

let economyManager;

(async () => {
	economyManager = await createEconomyManager();
})();

module.exports = {
	data: {
		name: 'checkBalance',
		description: 'Verifique seu saldo',
	},

	run: async ({ interaction, client, handler }) => {
		const userId = interaction.user.id; // Get the user ID from the interaction
		try {
			const balance = await economyManager.getBalance(userId); // Call the getBalance method
			interaction.reply(`Seu saldo é: ${balance}`);
		} catch (error) {
			console.error(error);
			interaction.reply('Ocorreu um erro ao verificar seu saldo.');
		}
	},

	options: {
		cooldown: '1m',
	},
};

