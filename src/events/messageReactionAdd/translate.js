const translateReactionHandler = require('../../helpers/translateReactionHandler');

module.exports = async (reaction, user, client) => {
    try {
        await translateReactionHandler(reaction, user, client);
    } catch (error) {
        console.error('Error in messageReactionAdd event handler:', error);
    }
};
