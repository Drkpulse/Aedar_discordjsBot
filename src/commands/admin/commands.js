const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isCommandActive } = require('../../helpers/commandManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commands')
        .setDescription('List all bot commands and their status')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Filter commands by category')
                .setRequired(false)
                .setAutocomplete(true)),

    autocomplete: async ({ interaction, handler }) => {
        // Get the focused option
        const focusedValue = interaction.options.getFocused().toLowerCase();
        // Get all categories from commands
        const categories = new Set();

        if (handler && handler.commands) {
            const commandEntries = Array.from(handler.commands.entries());
            for (const [_, command] of commandEntries) {
                // Capitalize the first letter of the category
                const category = command.category || 'Uncategorized';
                categories.add(capitalizeFirstLetter(category));
            }
        }

        // Filter categories based on input
        const filtered = Array.from(categories)
            .filter(category => category.toLowerCase().includes(focusedValue))
            .slice(0, 25);

        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice }))
        );
    },

    run: async ({ interaction, client, handler }) => {
        // Always make responses ephemeral
        const ephemeral = true;
        const filterCategory = interaction.options.getString('category');

        await interaction.deferReply({ ephemeral });

        const guildId = interaction.guild.id;

        // Group commands by category
        const categories = {};

        // Check if handler.commands exists and is iterable
        if (!handler || !handler.commands) {
            return interaction.editReply({
                content: '❌ Command information is not available at this time.'
            });
        }

        // Convert handler.commands to an array if it's a Map
        const commandEntries = Array.from(handler.commands.entries());

        for (const [name, command] of commandEntries) {
            // Capitalize the first letter of the category
            const category = capitalizeFirstLetter(command.category || 'Uncategorized');

            // Skip if filtering by category and this isn't the requested category
            if (filterCategory && category !== filterCategory) continue;

            if (!categories[category]) {
                categories[category] = [];
            }

            // Check global and guild-specific status
            const isGloballyActive = command.options?.isActive !== false;
            const isGuildActive = isCommandActive(name, guildId);
            const cooldown = command.options?.cooldown || 'None';
            const isAdmin = command.options?.isAdmin ? true : false;

            // Get the actual command name from the data object
            // This is critical to show the proper name instead of a number
            const commandName = command.data?.name || name;

            categories[category].push({
                name: commandName, // Use the actual slash command name
                description: command.data.description || 'No description',
                isActive: isGloballyActive && isGuildActive,
                isGloballyActive,
                isGuildActive,
                cooldown,
                isAdmin
            });
        }

        // Check if we have any categories
        if (Object.keys(categories).length === 0) {
            if (filterCategory) {
                return interaction.editReply({
                    content: `❌ No commands found in the "${filterCategory}" category.`
                });
            } else {
                return interaction.editReply({
                    content: '❌ No commands found or command data is not in the expected format.'
                });
            }
        }

        // Create embeds for each category
        const embeds = [];

        Object.entries(categories).forEach(([category, commands]) => {
            // Fix the sorting error by ensuring names are strings
            commands.sort((a, b) => {
                if (a.isActive !== b.isActive) return b.isActive ? 1 : -1;
                return String(a.name).localeCompare(String(b.name));
            });

            const embed = new EmbedBuilder()
                .setTitle(`${category} Commands`)
                .setColor('#0099ff')
                .setTimestamp()
                .setDescription(
                    commands.map(cmd => {
                        const statusEmoji = cmd.isActive ? '🟢' : '🔴';
                        const adminBadge = cmd.isAdmin ? '👑 ' : '';
                        const cooldownInfo = cmd.cooldown !== 'None' ? `\n┗ **Cooldown:** ${cmd.cooldown}` : '';

                        let statusReason = '';
                        if (!cmd.isGloballyActive) {
                            statusReason = ' (globally disabled)';
                        } else if (!cmd.isGuildActive) {
                            statusReason = ' (disabled in this server)';
                        }

                        return `${statusEmoji} ${adminBadge}**/${cmd.name}**${statusReason}\n┗ ${cmd.description}${cooldownInfo}`;
                    }).join('\n\n')
                )
                .setFooter({ text: `${commands.length} commands in this category` });

            embeds.push(embed);
        });

        // Add a summary embed
        const totalCommands = filterCategory
            ? Object.values(categories).flat().length
            : handler.commands.size;

        const activeCommands = Object.values(categories)
            .flat()
            .filter(cmd => cmd.isActive)
            .length;

        const categoryCount = Object.keys(categories).length;
        const adminCommands = Object.values(categories)
            .flat()
            .filter(cmd => cmd.isAdmin)
            .length;

        const summaryEmbed = new EmbedBuilder()
            .setTitle('Bot Commands')
            .setColor('#00ff00')
            .setTimestamp()
            .setDescription(`
                ${filterCategory ? `**Viewing:** ${filterCategory} category\n` : '**Showing all command categories**\n'}
                **Total Commands:** ${totalCommands}
                **Active Commands:** ${activeCommands} (${Math.round((activeCommands/totalCommands)*100)}%)
                **Admin Commands:** ${adminCommands}
                ${!filterCategory ? `**Categories:** ${categoryCount}` : ''}

                **Legend:**
                🟢 - Active command
                🔴 - Disabled command
                👑 - Admin-only command

                Use \`/toggle\` to enable or disable commands for this server.
            `)
            .setFooter({ text: filterCategory ? 'Use without category to see all commands' : 'Use the category option to filter commands' });

        // If filtering by category, only show summary and that category
        if (filterCategory) {
            // Find the specific category embed
            const categoryEmbed = embeds.find(embed =>
                embed.data.title === `${filterCategory} Commands`
            );

            if (categoryEmbed) {
                return interaction.editReply({
                    embeds: [summaryEmbed, categoryEmbed],
                    components: []
                });
            } else {
                return interaction.editReply({
                    embeds: [summaryEmbed],
                    components: []
                });
            }
        }

        // Otherwise show all categories with pagination
        embeds.unshift(summaryEmbed);

        // Send first embed
        const message = await interaction.editReply({
            embeds: [embeds[0]],
            components: createNavigationRow(embeds.length, 0)
        });

        // Create a collector for the pagination
        const collector = message.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 300000 // 5 minutes
        });

        let currentPage = 0;

        collector.on('collect', async i => {
            await i.deferUpdate();

            if (i.customId === 'prev') {
                currentPage = (currentPage - 1 + embeds.length) % embeds.length;
            } else if (i.customId === 'next') {
                currentPage = (currentPage + 1) % embeds.length;
            } else if (i.customId === 'first') {
                currentPage = 0;
            } else if (i.customId === 'last') {
                currentPage = embeds.length - 1;
            }

            await interaction.editReply({
                embeds: [embeds[currentPage]],
                components: createNavigationRow(embeds.length, currentPage)
            });
        });

        collector.on('end', async () => {
            await interaction.editReply({
                components: []
            }).catch(() => {});
        });
    },

    options: {
        cooldown: '5s',
        isActive: true,
        isAdmin: true,
        category: 'Admin'
    },
};

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    if (!string) return 'Uncategorized';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createNavigationRow(totalPages, currentPage) {
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

    const firstButton = new ButtonBuilder()
        .setCustomId('first')
        .setLabel('First')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⏮️')
        .setDisabled(totalPages <= 1 || currentPage === 0);

    const prevButton = new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('◀️')
        .setDisabled(totalPages <= 1 || currentPage === 0);

    const pageIndicator = new ButtonBuilder()
        .setCustomId('page')
        .setLabel(`${currentPage + 1}/${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const nextButton = new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('▶️')
        .setDisabled(totalPages <= 1 || currentPage === totalPages - 1);

    const lastButton = new ButtonBuilder()
        .setCustomId('last')
        .setLabel('Last')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⏭️')
        .setDisabled(totalPages <= 1 || currentPage === totalPages - 1);

    return [
        new ActionRowBuilder().addComponents(firstButton, prevButton, pageIndicator, nextButton, lastButton)
    ];
}
