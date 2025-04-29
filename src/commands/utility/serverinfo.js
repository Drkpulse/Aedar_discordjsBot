const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Displays detailed information about the server'),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply();

        const guild = interaction.guild;

        // Get guild information
        const { name, id, ownerId, memberCount, createdAt, preferredLocale, description } = guild;
        const owner = await client.users.fetch(ownerId);

        // Get channel statistics
        const totalChannels = guild.channels.cache.size;
        const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
        const categoryChannels = guild.channels.cache.filter(c => c.type === 4).size;

        // Get role information
        const roles = guild.roles.cache.size;

        // Get emoji information
        const emojis = guild.emojis.cache.size;

        // Get boost information
        const boostLevel = guild.premiumTier;
        const boostCount = guild.premiumSubscriptionCount;

        // Create server features list
        const features = guild.features.join(', ') || 'None';

        // Calculate server age
        const createdTime = Math.floor(createdAt.getTime() / 1000);

        const embed = new EmbedBuilder()
            .setTitle(`${name} Server Information`)
            .setColor('#5865F2')
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: '📋 General', value: [
                    `**ID:** ${id}`,
                    `**Owner:** ${owner.tag}`,
                    `**Created:** <t:${createdTime}:R>`,
                    `**Members:** ${memberCount}`,
                    `**Locale:** ${preferredLocale}`
                ].join('\n'), inline: true },
                { name: '📊 Statistics', value: [
                    `**Channels:** ${totalChannels}`,
                    `• Text: ${textChannels}`,
                    `• Voice: ${voiceChannels}`,
                    `• Categories: ${categoryChannels}`,
                    `**Roles:** ${roles}`,
                    `**Emojis:** ${emojis}`
                ].join('\n'), inline: true },
                { name: '✨ Boosts', value: `Level ${boostLevel} (${boostCount} boosts)`, inline: false },
                { name: '🔍 Features', value: features, inline: false }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        if (description) {
            embed.setDescription(description);
        }

        if (guild.bannerURL()) {
            embed.setImage(guild.bannerURL({ size: 1024 }));
        }

        await interaction.editReply({ embeds: [embed] });
    },

    options: {
        cooldown: '10s',
        isActive: true,
    },
};
