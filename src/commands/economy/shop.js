const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const economyManager = require('../../utils/economyManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Mostra a loja de itens disponíveis para compra'),

    run: async ({ interaction }) => {
        try {
            // Get shop items from economy manager
            const shopItems = await economyManager.getShopItems();

            if (!shopItems || shopItems.length === 0) {
                return await interaction.reply('Não há itens disponíveis na loja no momento.');
            }

            // Create embed for shop
            const embed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle('🛒 Loja de Itens 🛒')
                .setDescription('Use `/buy item [id]` para comprar um item.')
                .setTimestamp();

            // Add fields for each item
            for (const item of shopItems) {
                embed.addFields({
                    name: `${item.emoji} ${item.name} (ID: ${item.id})`,
                    value: `**Preço:** ${item.price} moedas\n**Descrição:** ${item.description}`
                });
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao mostrar loja:', error.message);
            await interaction.reply({
                content: 'Ocorreu um erro ao carregar a loja. Tente novamente mais tarde.',
                ephemeral: true
            });
        }
    },
};
