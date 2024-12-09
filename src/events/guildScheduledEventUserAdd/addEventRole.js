const { GuildScheduledEventUserAdd } = require('discord.js');

module.exports = async (event, user, client) => {
    try {
        // Get the guild (server) where the event is happening
        const guild = client.guilds.cache.get(event.guild.id);

        // Create a role with the event name
        const roleName = event.name; // Use the event name as the role name
        const existingRole = guild.roles.cache.find(role => role.name === roleName);

        let role;
        if (!existingRole) {
            // Create the role if it doesn't exist
            role = await guild.roles.create({
                name: roleName,
                //color: 'PURPLE', // You can choose any color you like
                reason: `Role created for event: ${event.name}`,
            });
            console.log(`Role created: ${roleName}`);
        } else {
            role = existingRole;
            console.log(`Role already exists: ${roleName}`);
        }

        // Assign the role to the user
        const member = await guild.members.fetch(user.id);
        await member.roles.add(role);
        console.log(`Role ${roleName} added to user ${user.username}`);
    } catch (error) {
        console.error('Error adding role to user:', error);
    }
};
