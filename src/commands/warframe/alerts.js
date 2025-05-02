const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getWarframeAlerts } = require('../../helpers/warframeapi.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alerts')
        .setDescription('Check the current Warframe Alerts.'),

    run: async ({ interaction }) => {
        await interaction.deferReply();

        const alerts = await getWarframeAlerts();

        if (alerts && alerts.length > 0) {
            // Create embed
            const embed = new EmbedBuilder()
                .setTitle('Current Warframe Alerts')
                .setColor('#E74C3C')
                .setTimestamp()
                .setFooter({ text: 'Data provided by Warframe API' });

            // Add fields for each alert
            alerts.forEach(alert => {
                // Calculate time remaining
                const expiryTime = new Date(alert.expiry);
                const timeLeft = expiryTime - new Date();
                const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

                // Format rewards
                let rewards = 'Credits';
                if (alert.mission.reward && alert.mission.reward.items && alert.mission.reward.items.length > 0) {
                    rewards = alert.mission.reward.items.join(', ');
                } else if (alert.mission.reward && alert.mission.reward.countedItems && alert.mission.reward.countedItems.length > 0) {
                    rewards = alert.mission.reward.countedItems.map(item => `${item.count}x ${item.type}`).join(', ');
                }

                let fieldValue = `**Type**: ${alert.mission.type}\n`;
                fieldValue += `**Enemy**: ${alert.mission.faction} (Level ${alert.mission.minEnemyLevel}-${alert.mission.maxEnemyLevel})\n`;
                fieldValue += `**Rewards**: ${rewards}\n`;
                fieldValue += `**Time Remaining**: ${hoursLeft}h ${minutesLeft}m`;

                embed.addFields({
                    name: `Alert on ${alert.mission.node}`,
                    value: fieldValue,
                    inline: false
                });
            });

            if (alerts.length === 0) {
                embed.setDescription('There are no active alerts at the moment.');
            }

            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.editReply('There are no active alerts at the moment.');
        }
    },
    options: {
        cooldown: '1m',
    },
};
