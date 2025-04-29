const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Displays information about a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to get information about')
                .setRequired(false)),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(targetUser.id);

        // User information
        const { id, tag, createdAt } = targetUser;
        const createdTime = Math.floor(createdAt.getTime() / 1000);

        // Member information (if available)
        let joinedAt, nickname, roles, highestRole, memberColor;

        if (member) {
            joinedAt = Math.floor(member.joinedAt.getTime() / 1000);
            nickname = member.nickname || 'None';
            roles = member.roles.cache.size - 1; // Subtract @everyone role
            highestRole = member.roles.highest.name !== '@everyone' ? member.roles.highest.name : 'None';
            memberColor = member.displayHexColor !== '#000000' ? member.displayHexColor : '#FFFFFF';
        }

        const embed = new EmbedBuilder()
            .setTitle(`User Information: ${targetUser.username}`)
            .setColor(member ? memberColor : '#5865F2')
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: '👤 User Details', value: [
                    `**Tag:** ${tag}`,
                    `**ID:** ${id}`,
                    `**Account Created:** <t:${createdTime}:R>`
                ].join('\n'), inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        // Add server-specific info if the user is a member
        if (member) {
            embed.addFields(
                { name: '📋 Server Member Details', value: [
                    `**Joined Server:** <t:${joinedAt}:R>`,
                    `**Nickname:** ${nickname}`,
                    `**Roles:** ${roles}`,
                    `**Highest Role:** ${highestRole}`
                ].join('\n'), inline: true }
            );

            // Add all roles (except @everyone)
            const memberRoles = member.roles.cache
                .filter(role => role.name !== '@everyone')
                .map(role => `<@&${role.id}>`)
                .join(', ');

            if (memberRoles) {
                embed.addFields({ name: '🔰 Roles', value: memberRoles });
            }
        }

        await interaction.editReply({ embeds: [embed] });
    },

    options: {
        cooldown: '5s',
        isActive: true,
    },
};
