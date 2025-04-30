const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getWarframeInvasions } = require('../../helpers/warframeapi.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invasions')
        .setDescription('Check the current Warframe Invasions.'),

    run: async ({ interaction }) => {
        await interaction.deferReply();

        const invasions = await getWarframeInvasions();

        if (invasions && invasions.length > 0) {
            // Filter only active invasions
            const activeInvasions = invasions.filter(invasion => !invasion.completed);

            if (activeInvasions.length === 0) {
                await interaction.editReply('There are no active invasions at the moment.');
                return;
            }

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle('Current Warframe Invasions')
                .setColor('#3498DB')
                .setDescription(`There are ${activeInvasions.length} active invasions.`)
                .setTimestamp()
                .setFooter({ text: 'Data provided by Warframe API' });

            // Add fields for each invasion (limit to 10 to avoid hitting embed limits)
            const displayInvasions = activeInvasions.slice(0, 10);

            displayInvasions.forEach(invasion => {
                // Calculate completion percentage
                const completion = Math.abs(Math.round(invasion.completion));

                // Determine rewards
                const attackerReward = invasion.attackerReward.itemString || 'Credits';
                const defenderReward = invasion.defenderReward.itemString || 'Credits';

                let fieldValue = `**Node**: ${invasion.node}\n`;
                fieldValue += `**Progress**: ${completion}%\n`;
                fieldValue += `**${invasion.attackingFaction}**: ${attackerReward}\n`;
                fieldValue += `**${invasion.defendingFaction}**: ${defenderReward}`;

                embed.addFields({
                    name: `${invasion.desc}`,
                    value: fieldValue,
                    inline: false
                });
            });

            if (activeInvasions.length > 10) {
                embed.addFields({
                    name: 'Note',
                    value: `Showing 10 of ${activeInvasions.length} active invasions.`,
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.editReply('Unable to fetch invasion information at this time.');
        }
    },
    options: {
        cooldown: '1m',
    },
};
