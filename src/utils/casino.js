import economyManager from './economyManager.js';

// Shared bet handling for the casino games (/slots, /roulette, /hilo).
// The bet is taken before the game starts, so a player can't bet coins they spend elsewhere mid-game.

/**
 * Takes the bet from the player's balance.
 * @returns {Promise<{ ok: true, balance: number } | { ok: false, message: string }>}
 */
export async function placeBet(userId, amount) {
	if (!Number.isInteger(amount) || amount <= 0) {
		return { ok: false, message: '❌ Aposta inválida! Aposte pelo menos 1 moeda.' };
	}

	try {
		const balance = await economyManager.removeBalance(userId, amount);
		return { ok: true, balance };
	} catch (error) {
		if (error.message === 'Insufficient balance' || error.message === 'User not found') {
			const balance = await economyManager.getBalance(userId).catch(() => 0);
			return { ok: false, message: `❌ Você não tem moedas suficientes. Seu saldo atual é de **${balance}** moedas.` };
		}
		throw error;
	}
}

/**
 * Pays winnings (bet included) into the player's balance. Returns the new balance.
 */
export async function payOut(userId, amount) {
	if (amount <= 0) return economyManager.getBalance(userId);
	return economyManager.addBalance(userId, amount);
}
