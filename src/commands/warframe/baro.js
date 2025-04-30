const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getWarframeBaro } = require('../../helpers/warframeapi.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('baro')
        .setDescription('Check Baro Ki\'Teer status and inventory.'),

    run: async ({ interaction }) => {
        await interaction.deferReply();

        const baro = await getWarframeBaro();

        if (baro) {
            const embed = new EmbedBuilder()
                .setTitle('Baro Ki\'Teer')
                .setColor('#9B59B6')
                .setTimestamp()
                .setFooter({ text: 'Data provided by Warframe API' });

            const isActive = baro.active;
            const arrivalTime = new Date(baro.activation);
            const departureTime = new Date(baro.expiry);
            const currentTime = new Date();

            if (isActive) {
                // Calculate remaining time
                const timeLeft = departureTime - currentTime;
                const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

                embed.setDescription(`Baro Ki'Teer is currently at **${baro.location}**!\nHe will leave in: **${daysLeft}d ${hoursLeft}h ${minutesLeft}m**`);

                // Display inventory if available
                if (baro.inventory && baro.inventory.length > 0) {
                    let inventoryText = '';
                    baro.inventory.forEach(item => {
                        inventoryText += `• **${item.item}** - ${item.ducats} Ducats & ${item.credits} Credits\n`;
                    });

                    embed.addFields({
                        name: 'Inventory',
                        value: inventoryText
                    });
                } else {
                    embed.addFields({
                        name: 'Inventory',
                        value: 'Inventory information not available.'
                    });
                }
            } else {
                // Calculate time until arrival
                const timeUntil = arrivalTime - currentTime;
                const daysUntil = Math.floor(timeUntil / (1000 * 60 * 60 * 24));
                const hoursUntil = Math.floor((timeUntil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

                embed.setDescription(`Baro Ki'Teer will arrive at **${baro.location}** in: **${daysUntil}d ${hoursUntil}h ${minutesUntil}m**`);
            }

            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.editReply('Unable to fetch Baro Ki\'Teer information at this time.');
        }
    },
    options: {
        cooldown: '1m',
    },
};
