const commandStates = {};

/**
 * Set the active state for a command
 * @param {string} commandKey - Command name or command-guildId
 * @param {boolean} isActive - Whether the command is active
 */
const setCommandState = (commandKey, isActive) => {
    commandStates[commandKey] = isActive;
};

/**
 * Check if a command is active
 * @param {string} commandName - The command name
 * @param {string|null} guildId - The guild ID (if in a guild context)
 * @returns {boolean} Whether the command is active
 */
const isCommandActive = (commandName, guildId = null) => {
    // If we have a guild-specific setting, that takes precedence
    if (guildId && commandStates[`${commandName}-${guildId}`] !== undefined) {
        return commandStates[`${commandName}-${guildId}`];
    }

    // Otherwise, fall back to global setting
    return commandStates[commandName] !== false;
};

/**
 * Load command states from MongoDB
 * @param {object} db - MongoDB database connection
 */
const loadCommandStates = async (db) => {
    try {
        const collection = db.collection('commandSettings');
        const settings = await collection.find({}).toArray();

        for (const setting of settings) {
            const { guildId, commandName, enabled } = setting;
            setCommandState(`${commandName}-${guildId}`, enabled);
        }

        console.log(`Loaded ${settings.length} command settings from database`);
    } catch (error) {
        console.error('Error loading command states:', error);
    }
};

module.exports = {
    setCommandState,
    isCommandActive,
    loadCommandStates,
};
