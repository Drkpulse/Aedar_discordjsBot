import translateReactionHandler from '../../../helpers/translateReactionHandler.js';

export default async (messageReaction, user, client, handler) => {
	try {
		await translateReactionHandler(messageReaction, user, client);
	} catch (error) {
		console.error('Error in messageReactionAdd event handler:', error);
	}
};
