const { SlashCommandBuilder } = require('@discordjs/builders');
const economyManager = require('../../utils/economyManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Compra um item da loja')
        .addStringOption(option =>
            option.setName('item_id')
                .setDescription('ID do item que você deseja comprar')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('quantity')
                .setDescription('Quantidade que deseja comprar')
                .setMinValue(1)
                .setRequired(false)
        ),

    run: async ({ interaction }) => {
        const userId = interaction.user.id;
        const itemId = interaction.options.getString('item_id');
        const quantity = interaction.options.getInteger('quantity') || 1;

        try {
            // Get item details
            const item = await economyManager.getShopItem(itemId);

            if (!item) {
                return await interaction.reply({
                    content: `Item com ID "${itemId}" não encontrado na loja.`,
                    ephemeral: true
                });
            }

            // Check user balance
            const userBalance = await economyManager.getBalance(userId);
            const totalCost = item.price * quantity;

            if (userBalance < totalCost) {
                return await interaction.reply({
                    content: `Você não tem moedas suficientes. O custo total é de **${totalCost}** moedas, mas você tem apenas **${userBalance}**.`,
                    ephemeral: true
                });
            }

            // Process purchase
            await economyManager.removeBalance(userId, totalCost);
            await economyManager.addItemToInventory(userId, itemId, quantity);

            await interaction.reply(`Compra realizada com sucesso! Você comprou **${quantity}x ${item.emoji} ${item.name}** por **${totalCost}** moedas.`);
        } catch (error) {
            console.error('Erro ao comprar item:', error.message);
            await interaction.reply({
                content: 'Ocorreu um erro ao processar sua compra. Tente novamente mais tarde.',
                ephemeral: true
            });
        }
    },
};
