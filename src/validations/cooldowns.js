const { Collection } = require('discord.js');
const cooldowns = new Collection();

module.exports = ({ interaction, commandObj }) => {
    if (!commandObj.options?.cooldown) return false;

    const { options } = commandObj;
    const cooldownAmount = parseCooldown(options.cooldown);

    // If the cooldown amount is invalid, log a warning and don't apply cooldown
    if (!cooldownAmount) {
        console.warn(`Invalid cooldown format for command ${interaction.commandName}: ${options.cooldown}`);
        return false;
    }

    const userId = interaction.user.id;
    const commandName = interaction.commandName;

    // Create a unique key for this user and command
    const key = `${userId}-${commandName}`;

    // If the collection doesn't have this user/command pair yet, add it
    if (!cooldowns.has(key)) {
        cooldowns.set(key, Date.now());
        setTimeout(() => cooldowns.delete(key), cooldownAmount);
        return false;
    }

    const expirationTime = cooldowns.get(key) + cooldownAmount;
    const timeLeft = (expirationTime - Date.now()) / 1000;

    // If the cooldown hasn't expired
    if (Date.now() < expirationTime) {
        const formattedTime = formatCooldownTime(timeLeft);

        // Check if we can defer - needed for CommandKit's structure
        if (typeof interaction.deferReply === 'function') {
            interaction.deferReply({ ephemeral: true })
                .then(() => {
                    if (typeof interaction.editReply === 'function') {
                        interaction.editReply({
                            content: `Por favor aguarde ${formattedTime} antes de usar \`/${commandName}\` novamente.`,
                            ephemeral: true
                        }).catch(console.error);
                    }
                }).catch(error => {
                    console.error('Error in cooldown deferReply:', error);
                });
        } else if (typeof interaction.respond === 'function') {
            // Try to use respond for autocomplete interactions
            interaction.respond([
                { name: `Cooldown: wait ${formattedTime}`, value: 'cooldown' }
            ]).catch(console.error);
        } else {
            console.error('No suitable reply method found for this interaction type');
        }

        return true;
    }

    // If the cooldown has expired, update the timestamp and allow the command
    cooldowns.set(key, Date.now());
    setTimeout(() => cooldowns.delete(key), cooldownAmount);
    return false;
};

// Helper function to parse cooldown string into milliseconds
function parseCooldown(cooldownStr) {
    if (!cooldownStr || typeof cooldownStr !== 'string') return null;

    const match = cooldownStr.match(/^(\d+)(ms|s|m|h|d)$/);
    if (!match) return null;

    const amount = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case 'ms': return amount;
        case 's': return amount * 1000;
        case 'm': return amount * 60 * 1000;
        case 'h': return amount * 60 * 60 * 1000;
        case 'd': return amount * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

// Format seconds into a human-readable string
function formatCooldownTime(seconds) {
    if (seconds < 60) return `${Math.ceil(seconds)} segundos`;

    const minutes = Math.ceil(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
}


