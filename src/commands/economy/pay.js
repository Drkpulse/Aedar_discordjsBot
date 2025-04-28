const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const createEconomyManager = require('../../helpers/economyManager');

let economyManager;

(async () => {
    economyManager = await createEconomyManager();
})();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Pague dinheiro para outro usuário')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Usuário para receber o dinheiro')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Quantidade a pagar')
                .setRequired(true)
                .setMinValue(1)
        )
        .addStringOption(option =>
            option
                .setName('currency')
                .setDescription('Tipo de moeda')
                .setRequired(true)
                .addChoices(
                    { name: 'Ouro', value: 'gold' },
                    { name: 'Prata', value: 'silver' },
                    { name: 'Bronze', value: 'bronze' }
                )
        ),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply();

        const sender = interaction.user;
        const recipient = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const currency = interaction.options.getString('currency');

        // Prevent paying self
        if (sender.id === recipient.id) {
            return await interaction.editReply('❌ Você não pode pagar a si mesmo.');
        }

        try {
            // Get sender balance
            const senderBalance = await economyManager.getBalance(sender.id);

            // Check if sender has enough funds
            if (senderBalance[currency] < amount) {
                return await interaction.editReply(`❌ Você não tem ${amount} ${currency} para pagar.`);
            }

            // Remove from sender
            await economyManager.removeBalance(sender.id, amount, currency);

            // Add to recipient
            await economyManager.addBalance(recipient.id, amount, currency);

            const currencyEmoji = {
                gold: '🥇',
                silver: '🥈',
                bronze: '🥉'
            }[currency];

            const embed = new EmbedBuilder()
                .setColor('#4287f5')
                .setTitle(`💸 Pagamento Realizado`)
                .setDescription(`${sender} pagou **${amount}** ${currencyEmoji} **${currency}** para ${recipient}`)
                .setFooter({ text: 'Sistema de Economia' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            if (error.message === "Insufficient balance or user not found.") {
                await interaction.editReply('❌ Saldo insuficiente para esta transferência.');
            } else {
                await interaction.editReply('❌ Ocorreu um erro ao fazer o pagamento.');
            }
        }
    },

    options: {
        cooldown: '10s',
    },
};
