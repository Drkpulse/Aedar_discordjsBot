import { GuildScheduledEventDelete } from 'discord.js';
import { eventRoleName } from '../../../helpers/eventRoles.js';
import { isAutomaticFeatureEnabled } from '../../../helpers/featureManager.js';

export default async (event, client) => {
    if (!isAutomaticFeatureEnabled('eventRoles', event.guildId)) return;

    try {
        // Get the guild (server) where the event is happening
        const guild = client.guilds.cache.get(event.guild.id);

        // Find the role associated with the event name
        const roleName = eventRoleName(event.name);
        const role = guild.roles.cache.find(role => role.name === roleName);

        if (role) {
            // Delete the role
            await role.delete(`Role deleted for event: ${event.name}`);
            console.log(`Role ${roleName} deleted.`);
        } else {
            console.log(`Role ${roleName} does not exist, nothing to delete.`);
        }
    } catch (error) {
        console.error('Error deleting role:', error);
    }
};
