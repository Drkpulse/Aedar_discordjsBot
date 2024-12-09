const { GuildScheduledEventUserRemove } = require('discord.js');

module.exports = async (event, user, client) => {
    try {
        // Get the guild (server) where the event is happening
        const guild = client.guilds.cache.get(event.guild.id);

        // Find the role associated with the event name
        const roleName = event.name; // Use the event name as the role name
        const role = guild.roles.cache.find(role => role.name === roleName);

        if (role) {
            // Fetch the member (user) from the guild
            const member = await guild.members.fetch(user.id);

            // Remove the role from the user
            await member.roles.remove(role);
            console.log(`Role ${roleName} removed from user ${user.username}`);
        } else {
            console.log(`Role ${roleName} does not exist, nothing to remove.`);
        }
    } catch (error) {
        console.error('Error removing role from user:', error);
    }
};
