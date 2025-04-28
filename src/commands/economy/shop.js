const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const createEconomyManager = require('../../helpers/economyManager');

let economyManager;

(async () => {
    economyManager = await createEconomyManager();
})();

// Item shop catalog
const shopItems = [
    {
        id: 'vip_role',
        name: 'Cargo VIP',
        description: 'Um cargo especial que te dá status no servidor',
        price: { currency: 'gold', amount: 10 },
        category: 'roles'
    },
    {
        id: 'custom_color',
        name: 'Cor Personalizada',
        description: 'Tenha seu nome em uma cor única',
        price: { currency: 'silver', amount: 50 },
        category: 'roles'
    },
    {
        id: 'lootbox_basic',
        name: 'Lootbox Básica',
        description: 'Contém itens básicos e uma pequena chance de itens raros',
        price: { currency: 'bronze', amount: 100 },
        category: 'items'
    },
    {
        id: 'lootbox_premium',
        name: 'Lootbox Premium',
        description: 'Contém itens premium e uma boa chance de itens raros',
        price: { currency: 'silver', amount: 100 },
        category: 'items'
    },
    {
        id: 'lootbox_legendary',
        name: 'Lootbox Lendária',
        description: 'Contém itens lendários garantidos',
        price: { currency: 'gold', amount: 5 },
        category: 'items'
    }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Veja a loja de itens disponíveis')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('Veja os itens disponíveis na loja'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('buy')
                .setDescription('Compre um item da loja')),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'view') {
            // Group items by category
            const categories = {};
            shopItems.forEach(item => {
                if (!categories[item.category]) {
                    categories[item.category] = [];
                }
                categories[item.category].push(item);
            });

            const embed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle('🛒 Loja')
                .setDescription('Bem-vindo à loja! Aqui você pode comprar itens com seu dinheiro.')
                .setFooter({ text: 'Use /shop buy para comprar um item' })
                .setTimestamp();

            // Add each category as a field
            for (const [category, items] of Object.entries(categories)) {
                let fieldValue = '';

                items.forEach(item => {
                    const currencyEmoji = {
                        gold: '🥇',
                        silver: '🥈',
                        bronze: '🥉'
                    }[item.price.currency];

                    fieldValue += `**${item.name}** - ${item.price.amount} ${currencyEmoji}\n${item.description}\nID: \`${item.id}\`\n\n`;
                });

                embed.addFields({ name: `📦 ${category.charAt(0).toUpperCase() + category.slice(1)}`, value: fieldValue });
            }

            await interaction.editReply({ embeds: [embed] });
        } else if (subcommand === 'buy') {
            const userId = interaction.user.id;

            // Create select menu with items
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('shop_buy')
                .setPlaceholder('Selecione um item para comprar');

            shopItems.forEach(item => {
                const currencyEmoji = {
                    gold: '🥇',
                    silver: '🥈',
                    bronze: '🥉'
                }[item.price.currency];

                selectMenu.addOptions({
                    label: item.name,
                    description: `${item.price.amount} ${item.price.currency}`,
                    value: item.id,
                    emoji: currencyEmoji
                });
            });

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const response = await interaction.editReply({
                content: 'Selecione um item para comprar:',
                components: [row]
            });

            // Wait for user to select an item
            const filter = i => i.customId === 'shop_buy' && i.user.id === userId;

            try {
                const selection = await response.awaitMessageComponent({ filter, time: 60000 });

                // Find the selected item
                const selectedItem = shopItems.find(item => item.id === selection.values[0]);

                if (!selectedItem) {
                    return await selection.update({
                        content: 'Item não encontrado.',
                        components: []
                    });
                }

                // Check if user has enough money
                const balance = await economyManager.getBalance(userId);
                const userBalance = balance[selectedItem.price.currency];

                if (userBalance < selectedItem.price.amount) {
                    const currencyEmoji = {
                        gold: '🥇',
                        silver: '🥈',
                        bronze: '🥉'
                    }[selectedItem.price.currency];

                    return await selection.update({
                        content: `Você não tem dinheiro suficiente para comprar este item. Você precisa de ${selectedItem.price.amount} ${currencyEmoji} ${selectedItem.price.currency}.`,
                        components: []
                    });
                }

                // Process the purchase
                await economyManager.removeBalance(userId, selectedItem.price.amount, selectedItem.price.currency);

                // Here you would add item to user's inventory
                // This depends on how you want to implement inventory
                // For this example, we'll just acknowledge the purchase

                const currencyEmoji = {
                    gold: '🥇',
                    silver: '🥈',
                    bronze: '🥉'
                }[selectedItem.price.currency];

                const purchaseEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Compra realizada!')
                    .setDescription(`Você comprou **${selectedItem.name}** por ${selectedItem.price.amount} ${currencyEmoji} ${selectedItem.price.currency}.`)
                    .setFooter({ text: 'Obrigado pela sua compra!' })
                    .setTimestamp();

                await selection.update({
                    content: '',
                    embeds: [purchaseEmbed],
                    components: []
                });

            } catch (error) {
                console.error(error);
                await interaction.editReply({
                    content: 'Compra cancelada ou tempo esgotado.',
                    components: []
                });
            }
        }
    },

    options: {
        cooldown: '5s',
    },
};
