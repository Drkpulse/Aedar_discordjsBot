const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removebalance')
        .setDescription('Remove uma quantia do saldo do usuário especificado')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('O usuário cujo saldo será alterado')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('A quantidade a ser removida')
                .setRequired(true)
        ),

    run: async ({ interaction }) => {
        const userId = interaction.options.getUser('user').id; // Get the target user ID
        const amount = interaction.options.getInteger('amount'); // Get the amount to remove

        try {
            if (amount <= 0) {
                return await interaction.reply({ content: 'A quantidade deve ser maior que zero.', ephemeral: true });
            }

            await economyManager.removeBalance(userId, amount);
            await interaction.reply(`Removido **${amount}** moedas do saldo de <@${userId}>.`);
        } catch (error) {
            console.error('Erro ao remover saldo:', error.message);
            await interaction.reply({ content: 'Ocorreu um erro ao remover saldo. Tente novamente mais tarde.', ephemeral: true });
        }
    },
};
