const { SlashCommandBuilder } = require('@discordjs/builders');
const economyManager = require('../../utils/economyManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Transfere moedas para outro usuário')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('O usuário que receberá as moedas')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('A quantidade de moedas a transferir')
                .setRequired(true)
        ),

    run: async ({ interaction }) => {
        const fromUserId = interaction.user.id;
        const toUser = interaction.options.getUser('user');
        const toUserId = toUser.id;
        const amount = interaction.options.getInteger('amount');

        try {
            if (fromUserId === toUserId) {
                return await interaction.reply({
                    content: 'Você não pode transferir moedas para si mesmo.',
                    ephemeral: true
                });
            }

            if (amount <= 0) {
                return await interaction.reply({
                    content: 'A quantidade deve ser maior que zero.',
                    ephemeral: true
                });
            }

            // Check if sender has enough balance first
            const currentBalance = await economyManager.getBalance(fromUserId);
            if (currentBalance < amount) {
                return await interaction.reply({
                    content: `Saldo insuficiente. Você tem apenas ${currentBalance} moedas.`,
                    ephemeral: true
                });
            }

            const result = await economyManager.transferBalance(fromUserId, toUserId, amount);

            await interaction.reply(
                `Transferência concluída!\n` +
                `Você enviou **${amount}** moedas para ${toUser}.\n` +
                `Seu saldo atual: **${result.fromBalance}** moedas.`
            );
        } catch (error) {
            console.error('Erro na transferência:', error.message);

            if (error.message === 'Insufficient balance') {
                return await interaction.reply({
                    content: 'Saldo insuficiente para realizar esta transferência.',
                    ephemeral: true
                });
            }

            await interaction.reply({
                content: 'Ocorreu um erro ao transferir as moedas. Tente novamente mais tarde.',
                ephemeral: true
            });
        }
    },
};
