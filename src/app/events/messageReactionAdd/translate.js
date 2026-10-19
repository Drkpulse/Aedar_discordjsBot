import translateReactionHandler from '../../../helpers/translateReactionHandler.js';
import { isAutomaticFeatureEnabled } from '../../../helpers/featureManager.js';

export default async (messageReaction, user, client, handler) => {
	try {
		if (!isAutomaticFeatureEnabled('translate', messageReaction.message.guildId)) return;
		await translateReactionHandler(messageReaction, user, client);
	} catch (error) {
		console.error('Error in messageReactionAdd event handler:', error);
	}
};
