const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const createEconomyManager = require('../../helpers/economyManager');

let economyManager;

(async () => {
    economyManager = await createEconomyManager();
})();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Receba sua recompensa diária'),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply();

        const userId = interaction.user.id;

        try {
            // Check if the user already claimed their daily reward
            const lastClaim = await economyManager.getLastDailyClaim(userId);
            const now = new Date();

            // If the user has claimed today already
            if (lastClaim && new Date(lastClaim).toDateString() === now.toDateString()) {
                const nextClaimTime = new Date(lastClaim);
                nextClaimTime.setDate(nextClaimTime.getDate() + 1);
                const timeLeft = nextClaimTime - now;

                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

                return await interaction.editReply(`⌛ Você já recebeu sua recompensa diária! Volte em **${hours}h ${minutes}m**.`);
            }

            // Random rewards
            const goldAmount = Math.floor(Math.random() * 10) + 10; // 10-19
            const silverAmount = Math.floor(Math.random() * 20) + 20; // 20-39
            const bronzeAmount = Math.floor(Math.random() * 50) + 50; // 50-99

            // Update user's balance
            await economyManager.addBalance(userId, goldAmount, 'gold');
            await economyManager.addBalance(userId, silverAmount, 'silver');
            await economyManager.addBalance(userId, bronzeAmount, 'bronze');

            // Update last claim time
            await economyManager.setLastDailyClaim(userId, now);

            // Get updated balance
            const balances = await economyManager.getBalance(userId);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎁 Recompensa Diária')
                .setDescription(`Você recebeu:\n**${goldAmount}** 🥇 Ouro\n**${silverAmount}** 🥈 Prata\n**${bronzeAmount}** 🥉 Bronze`)
                .addFields(
                    { name: '🥇 Ouro', value: `${balances.gold}`, inline: true },
                    { name: '🥈 Prata', value: `${balances.silver}`, inline: true },
                    { name: '🥉 Bronze', value: `${balances.bronze}`, inline: true }
                )
                .setFooter({ text: 'Volte amanhã para mais recompensas!' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('Ocorreu um erro ao obter a recompensa diária.');
        }
    },

    options: {
        cooldown: '1m',
    },
};
