import { SlashCommandBuilder } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import economyManager from '../../../utils/economyManager.js';

export const command = new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Mostra os itens em seu inventário').toJSON();

export const chatInput = async ({ interaction }) => {
    const userId = interaction.user.id;

    try {
        // Get user inventory
        const inventory = await economyManager.getUserInventory(userId);

        if (!inventory || inventory.length === 0) {
            return await interaction.reply('Seu inventário está vazio. Compre itens com o comando `/shop` e `/buy`.');
        }

        // Create embed for inventory
        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('🎒 Seu Inventário 🎒')
            .setDescription('Itens que você possui:')
            .setFooter({ text: `Use /use [item_id] para usar um item` })
            .setTimestamp();

        // Add fields for each inventory item
        for (const item of inventory) {
            embed.addFields({
                name: `${item.emoji} ${item.name} (ID: ${item.id})`,
                value: `**Quantidade:** ${item.quantity}\n**Descrição:** ${item.description}`
            });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
        console.error('Erro ao mostrar inventário:', error.message);
        await interaction.reply({
            content: 'Ocorreu um erro ao carregar seu inventário. Tente novamente mais tarde.',
            ephemeral: true
        });
    }
};
