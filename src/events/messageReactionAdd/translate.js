const translateReactionHandler = require('../../helpers/translateReactionHandler');

module.exports = async (messageReaction, user, client, handler) => {
	try {
		await translateReactionHandler(messageReaction, user, client);
	} catch (error) {
		console.error('Error in messageReactionAdd event handler:', error);
	}
};
