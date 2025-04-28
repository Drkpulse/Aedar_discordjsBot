const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const createEconomyManager = require('../../helpers/economyManager');

let economyManager;

(async () => {
    economyManager = await createEconomyManager();
})();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('Aposte seu dinheiro e tente ganhar mais!')
        .addStringOption(option =>
            option
                .setName('currency')
                .setDescription('Tipo de moeda')
                .setRequired(true)
                .addChoices(
                    { name: 'Ouro', value: 'gold' },
                    { name: 'Prata', value: 'silver' },
                    { name: 'Bronze', value: 'bronze' }
                ))
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Quantidade para apostar')
                .setRequired(true)
                .setMinValue(1)),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const currency = interaction.options.getString('currency');
        const amount = interaction.options.getInteger('amount');

        try {
            // Check if user has enough money
            const balance = await economyManager.getBalance(userId);

            if (balance[currency] < amount) {
                return await interaction.editReply(`❌ Você não tem ${amount} ${currency} para apostar!`);
            }

            // Gambling logic
            const winChance = 0.4; // 40% chance to win
            const win = Math.random() < winChance;

            // Calculate win/loss amount
            let winAmount = 0;
            let resultMessage = '';
            let color = '';

            if (win) {
                winAmount = Math.floor(amount * 1.5); // 150% return on win
                resultMessage = `🎉 Você ganhou ${winAmount} ${currency}!`;
                color = '#00FF00';

                // Add winnings
                await economyManager.addBalance(userId, winAmount, currency);
            } else {
                winAmount = -amount; // Loss
                resultMessage = `😢 Você perdeu ${amount} ${currency}!`;
                color = '#FF0000';

                // Remove the bet amount
                await economyManager.removeBalance(userId, amount, currency);
            }

            // Get updated balance
            const newBalance = await economyManager.getBalance(userId);

            const currencyEmoji = {
                gold: '🥇',
                silver: '🥈',
                bronze: '🥉'
            }[currency];

            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle('🎰 Resultado da Aposta')
                .setDescription(resultMessage)
                .addFields(
                    { name: 'Aposta', value: `${amount} ${currencyEmoji}`, inline: true },
                    { name: 'Resultado', value: win ? 'Ganhou' : 'Perdeu', inline: true },
                    { name: `Saldo de ${currency}`, value: `${newBalance[currency]} ${currencyEmoji}`, inline: true }
                )
                .setFooter({ text: 'Boa sorte na próxima vez!' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('Ocorreu um erro ao processar sua aposta.');
        }
    },

    options: {
        cooldown: '30s',
    },
};
