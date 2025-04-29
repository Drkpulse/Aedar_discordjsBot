const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Bulk delete messages from a channel')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true))
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Filter messages by user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({ ephemeral: true });

        const amount = interaction.options.getInteger('amount');
        const targetUser = interaction.options.getUser('user');

        // Get messages from the channel
        const messages = await interaction.channel.messages.fetch({ limit: 100 });

        // Filter messages as needed
        let filteredMessages = messages;

        if (targetUser) {
            filteredMessages = messages.filter(msg => msg.author.id === targetUser.id);
        }

        // Limit to the requested amount and ensure they're not older than 14 days
        const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
        const messagesToDelete = filteredMessages
            .filter(msg => msg.createdTimestamp > twoWeeksAgo)
            .first(amount);

        if (messagesToDelete.length === 0) {
            return interaction.editReply({
                content: targetUser
                    ? `No recent messages found from ${targetUser.tag} to delete.`
                    : 'No recent messages found to delete.',
                ephemeral: true
            });
        }

        // Bulk delete the messages
        const deletedCount = await interaction.channel.bulkDelete(messagesToDelete, true)
            .then(deleted => deleted.size)
            .catch(error => {
                console.error('Error deleting messages:', error);
                return 0;
            });

        const response = targetUser
            ? `Successfully deleted ${deletedCount} messages from ${targetUser.tag}.`
            : `Successfully deleted ${deletedCount} messages.`;

        await interaction.editReply({ content: response, ephemeral: true });
    },

    options: {
        cooldown: '5s',
        isActive: true,
        userPermissions: ['ManageMessages'],
    },
};
