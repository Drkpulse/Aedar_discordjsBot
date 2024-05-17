class CooldownManager {
	constructor() {
		this.cooldowns = new Map(); // Map to store cooldowns
	}

	// Set cooldown for a user and command
	setCooldown(userId, commandName, cooldownDuration) {
	// Parse the cooldown duration in the format HHhMMmSSs
	const regex = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/;
	const match = regex.exec(cooldownDuration);
	let milliseconds = 0;
	if (match) {
		const [, hours, minutes, seconds] = match.map(Number);
		milliseconds = (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
	}

	const endTime = Date.now() + milliseconds * 1000;
	const userCooldowns = this.cooldowns.get(userId) || new Map();
	userCooldowns.set(commandName, endTime);
	this.cooldowns.set(userId, userCooldowns);
}


	// Check if a user is on cooldown for a command
	isOnCooldown(userId, commandName) {
		const userCooldowns = this.cooldowns.get(userId);
		if (userCooldowns && userCooldowns.has(commandName)) {
			const endTime = userCooldowns.get(commandName);
			return Date.now() < endTime; // Return true if still on cooldown
		}
		return false; // Not on cooldown
	}

	// Get remaining cooldown time in milliseconds
	getRemainingCooldown(userId, commandName) {
		const userCooldowns = this.cooldowns.get(userId);
		if (userCooldowns && userCooldowns.has(commandName)) {
			const endTime = userCooldowns.get(commandName);
			return Math.max(endTime - Date.now(), 0); // Return remaining cooldown time
		}
		return 0; // No cooldown or unknown user/command
	}
}

// Export an instance of the CooldownManager
module.exports = new CooldownManager();
