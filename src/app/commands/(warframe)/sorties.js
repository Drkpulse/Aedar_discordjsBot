import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getWarframeSortie } from '../../../helpers/warframeapi.js';

export const command = new SlashCommandBuilder()
    .setName('sortie')
    .setDescription('Check the current Warframe Sortie mission.').toJSON();

export const chatInput = async ({ interaction }) => {
    await interaction.deferReply();

    const sortie = await getWarframeSortie();

    if (sortie) {
        // Calculate time remaining
        const expiryTime = new Date(sortie.expiry);
        const timeLeft = expiryTime - new Date();
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        // Create embed
        const embed = new EmbedBuilder()
            .setTitle(`${sortie.boss} Sortie`)
            .setColor('#FF5733')
            .setDescription(`**Faction**: ${sortie.faction}\n**Time Remaining**: ${hoursLeft}h ${minutesLeft}m`)
            .setTimestamp()
            .setFooter({ text: 'Data provided by Warframe API' });

        // Add mission details
        sortie.variants.forEach((mission, index) => {
            embed.addFields({
                name: `Mission ${index + 1}: ${mission.missionType}`,
                value: `**Node**: ${mission.node}\n**Modifier**: ${mission.modifier}`,
                inline: false
            });
        });

        await interaction.editReply({ embeds: [embed] });
    } else {
        await interaction.editReply('Unable to fetch Sortie information at this time.');
    }
};

export const options = {
    cooldown: '1m',
};
