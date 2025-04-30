const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getDatabase } = require('../../helpers/mongoClient');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday')
        .setDescription('Gerencia datas de aniversário')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Adiciona ou atualiza a tua data de aniversário')
                .addIntegerOption(option =>
                    option.setName('dia')
                        .setDescription('Dia do teu aniversário')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(31))
                .addIntegerOption(option =>
                    option.setName('mes')
                        .setDescription('Mês do teu aniversário')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(12)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a tua data de aniversário'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Mostra os próximos aniversários'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Verifica a data de aniversário de um utilizador')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('O utilizador que queres verificar')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('manage')
                .setDescription('Gerenciar o teu aniversário com uma interface mais amigável')),

    run: async ({ interaction, client }) => {
        // Make deferReply ephemeral
        await interaction.deferReply({ ephemeral: true });

        const subcommand = interaction.options.getSubcommand();
        const db = await getDatabase();
        const birthdaysCollection = db.collection('birthdays');

        switch (subcommand) {
            case 'add':
                await handleAddBirthday(interaction, birthdaysCollection);
                break;
            case 'remove':
                await handleRemoveBirthday(interaction, birthdaysCollection);
                break;
            case 'list':
                await handleListBirthdays(interaction, birthdaysCollection, client);
                break;
            case 'check':
                await handleCheckBirthday(interaction, birthdaysCollection, client);
                break;
            case 'manage':
                await handleManageBirthday(interaction, birthdaysCollection, client);
                break;
        }
    },
    options: {
        cooldown: '10s',
    },
};

async function handleManageBirthday(interaction, collection, client) {
    const userId = interaction.user.id;
    const userBirthday = await collection.findOne({ userId });

    const embed = new EmbedBuilder()
        .setTitle('🎂 Gestão de Aniversário')
        .setColor('#FF69B4');

    const buttonRow = new ActionRowBuilder();

    if (userBirthday) {
        const formattedDate = `${userBirthday.day}/${userBirthday.month}`;
        embed.setDescription(`**O teu aniversário está definido para: ${formattedDate}**\n\nO que desejas fazer?`);

        buttonRow.addComponents(
            new ButtonBuilder()
                .setCustomId('update_birthday')
                .setLabel('Atualizar Data')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📝'),
            new ButtonBuilder()
                .setCustomId('remove_birthday')
                .setLabel('Remover Data')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️')
        );
    } else {
        embed.setDescription('**Não tens nenhuma data de aniversário definida.**\n\nDeseja adicionar a tua data de aniversário para receber felicitações no teu dia especial?');

        buttonRow.addComponents(
            new ButtonBuilder()
                .setCustomId('set_birthday')
                .setLabel('Definir Aniversário')
                .setStyle(ButtonStyle.Success)
                .setEmoji('➕')
        );
    }

    buttonRow.addComponents(
        new ButtonBuilder()
            .setCustomId('view_birthdays')
            .setLabel('Ver Próximos Aniversários')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📆')
    );

    await interaction.editReply({
        embeds: [embed],
        components: [buttonRow]
    });

    const filter = i => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 60000
    });

    collector.on('collect', async i => {
        await i.deferUpdate();

        if (i.customId === 'set_birthday' || i.customId === 'update_birthday') {
            const monthNames = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];

            // Create day buttons (we'll do 1-15 and 16-31 in separate rows)
            const dayRow1 = new ActionRowBuilder();
            const dayRow2 = new ActionRowBuilder();

            for (let day = 1; day <= 15; day++) {
                dayRow1.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`day_${day}`)
                        .setLabel(`${day}`)
                        .setStyle(ButtonStyle.Secondary)
                );
            }

            for (let day = 16; day <= 31; day++) {
                dayRow2.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`day_${day}`)
                        .setLabel(`${day}`)
                        .setStyle(ButtonStyle.Secondary)
                );
            }

            const promptEmbed = new EmbedBuilder()
                .setTitle('🎂 Definir Aniversário')
                .setDescription('**Passo 1:** Seleciona o dia do teu aniversário:')
                .setColor('#FF69B4');

            await i.editReply({
                embeds: [promptEmbed],
                components: [dayRow1, dayRow2]
            });

            // Collect day response
            const dayFilter = i => i.user.id === interaction.user.id && i.customId.startsWith('day_');
            try {
                const dayCollection = await interaction.channel.awaitMessageComponent({
                    filter: dayFilter,
                    componentType: ComponentType.Button,
                    time: 30000
                });

                const selectedDay = parseInt(dayCollection.customId.split('_')[1]);

                // Now show month selection
                const monthRow1 = new ActionRowBuilder();
                const monthRow2 = new ActionRowBuilder();

                for (let month = 1; month <= 6; month++) {
                    monthRow1.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`month_${month}`)
                            .setLabel(monthNames[month - 1])
                            .setStyle(ButtonStyle.Secondary)
                    );
                }

                for (let month = 7; month <= 12; month++) {
                    monthRow2.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`month_${month}`)
                            .setLabel(monthNames[month - 1])
                            .setStyle(ButtonStyle.Secondary)
                    );
                }

                const monthPromptEmbed = new EmbedBuilder()
                    .setTitle('🎂 Definir Aniversário')
                    .setDescription(`**Passo 2:** Dia **${selectedDay}** selecionado. Agora escolhe o mês:`)
                    .setColor('#FF69B4');

                await dayCollection.update({
                    embeds: [monthPromptEmbed],
                    components: [monthRow1, monthRow2]
                });

                // Collect month response
                const monthFilter = i => i.user.id === interaction.user.id && i.customId.startsWith('month_');
                const monthCollection = await interaction.channel.awaitMessageComponent({
                    filter: monthFilter,
                    componentType: ComponentType.Button,
                    time: 30000
                });

                const selectedMonth = parseInt(monthCollection.customId.split('_')[1]);

                // Validate the date
                if (!isValidDate(selectedDay, selectedMonth)) {
                    const invalidEmbed = new EmbedBuilder()
                        .setTitle('❌ Data Inválida')
                        .setDescription(`Dia ${selectedDay} de ${monthNames[selectedMonth - 1]} não é uma data válida. Por favor, tente novamente.`)
                        .setColor('#FF0000');

                    await monthCollection.update({
                        embeds: [invalidEmbed],
                        components: []
                    });
                    return;
                }

                // Save the birthday
                await collection.updateOne(
                    { userId },
                    {
                        $set: {
                            userId,
                            username: interaction.user.username,
                            day: selectedDay,
                            month: selectedMonth,
                            year: new Date().getFullYear(),
                            lastUpdated: new Date()
                        }
                    },
                    { upsert: true }
                );

                const successEmbed = new EmbedBuilder()
                    .setTitle('✅ Aniversário Definido')
                    .setDescription(`O teu aniversário foi definido para **${selectedDay} de ${monthNames[selectedMonth - 1]}**!`)
                    .setColor('#00FF00');

                await monthCollection.update({
                    embeds: [successEmbed],
                    components: []
                });

            } catch (error) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle('⏰ Tempo Esgotado')
                    .setDescription('Não foi recebida nenhuma resposta a tempo. Por favor, tente novamente mais tarde.')
                    .setColor('#FF0000');

                await interaction.editReply({
                    embeds: [timeoutEmbed],
                    components: []
                }).catch(() => {});
            }

        } else if (i.customId === 'remove_birthday') {
            const result = await collection.deleteOne({ userId });

            const embed = new EmbedBuilder()
                .setColor(result.deletedCount > 0 ? '#00FF00' : '#FF0000')
                .setTitle(result.deletedCount > 0 ? '✅ Aniversário Removido' : '❌ Erro')
                .setDescription(result.deletedCount > 0
                    ? 'A tua data de aniversário foi removida com sucesso.'
                    : 'Não foi encontrada nenhuma data de aniversário para remover.');

            await i.editReply({
                embeds: [embed],
                components: []
            });

        } else if (i.customId === 'view_birthdays') {
            collector.stop();
            await handleListBirthdays(interaction, collection, client);
        }
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            const timeoutEmbed = new EmbedBuilder()
                .setTitle('⏰ Tempo Esgotado')
                .setDescription('A sessão expirou. Use o comando novamente se necessário.')
                .setColor('#FF0000');

            interaction.editReply({
                embeds: [timeoutEmbed],
                components: []
            }).catch(() => {});
        }
    });
}

async function handleAddBirthday(interaction, collection) {
    const userId = interaction.user.id;
    const day = interaction.options.getInteger('dia');
    const month = interaction.options.getInteger('mes');

    // Validate date
    if (!isValidDate(day, month)) {
        return interaction.editReply('❌ Data inválida. Por favor, insira uma data válida.');
    }

    // Check if user already has a birthday
    const existingBirthday = await collection.findOne({ userId });
    const isUpdate = !!existingBirthday;

    await collection.updateOne(
        { userId },
        {
            $set: {
                userId,
                username: interaction.user.username,
                day,
                month,
                year: new Date().getFullYear(),
                lastUpdated: new Date()
            }
        },
        { upsert: true }
    );

    // Format date to Portuguese format
    const date = `${day}/${month}`;

    const embed = new EmbedBuilder()
        .setTitle(isUpdate ? '✅ Aniversário Atualizado' : '✅ Aniversário Adicionado')
        .setDescription(`O teu aniversário foi ${isUpdate ? 'atualizado' : 'adicionado'} para: **${date}**`)
        .setColor('#00FF00')
        .setFooter({ text: 'Serás notificado no teu dia especial!' });

    await interaction.editReply({ embeds: [embed] });
}

async function handleRemoveBirthday(interaction, collection) {
    const userId = interaction.user.id;
    const result = await collection.deleteOne({ userId });

    const embed = new EmbedBuilder()
        .setColor(result.deletedCount > 0 ? '#00FF00' : '#FF0000')
        .setTitle(result.deletedCount > 0 ? '✅ Aniversário Removido' : '❌ Erro')
        .setDescription(result.deletedCount > 0
            ? 'A tua data de aniversário foi removida com sucesso.'
            : 'Não foi encontrada nenhuma data de aniversário para remover.');

    await interaction.editReply({ embeds: [embed] });
}

async function handleListBirthdays(interaction, collection, client) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    const userId = interaction.user.id;

    // Get all birthdays
    const birthdays = await collection.find({}).toArray();

    if (birthdays.length === 0) {
      return interaction.editReply('Não existem aniversários registados.');
    }

    // Sort birthdays by upcoming date
    birthdays.sort((a, b) => {
      // Check if birthday has passed this year
      const aIsUpcoming = a.month > currentMonth || (a.month === currentMonth && a.day >= currentDay);
      const bIsUpcoming = b.month > currentMonth || (b.month === currentMonth && b.day >= currentDay);

      // Sort by upcoming birthdays first
      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;

      // Sort by month
      if (a.month !== b.month) return a.month - b.month;

      // Sort by day
      return a.day - b.day;
    });

    // Find the user's birthday
    const userBirthdayIndex = birthdays.findIndex(b => b.userId === userId);
    const userBirthday = userBirthdayIndex !== -1 ? birthdays[userBirthdayIndex] : null;

    // Create a new array with user's birthday first (if exists) followed by all others
    let arrangedBirthdays = [];
    if (userBirthday) {
      // Remove user's birthday from the array to avoid duplication
      birthdays.splice(userBirthdayIndex, 1);
      // Add user's birthday at the start
      arrangedBirthdays = [userBirthday, ...birthdays];
    } else {
      arrangedBirthdays = [...birthdays];
    }

    // Create pages with 5 birthdays each
    const birthdaysPerPage = 5;
    const totalPages = Math.ceil(arrangedBirthdays.length / birthdaysPerPage);
    const pages = [];

    for (let i = 0; i < totalPages; i++) {
      const startIndex = i * birthdaysPerPage;
      const pageItems = arrangedBirthdays.slice(startIndex, startIndex + birthdaysPerPage);

      const pageEmbed = new EmbedBuilder()
        .setTitle('🎂 Próximos Aniversários')
        .setColor('#FF69B4')
        .setFooter({ text: `Página ${i + 1}/${totalPages} • Adiciona o teu usando /birthday manage` });

      const birthdayList = pageItems.map(birthday => {
        const formattedDate = `${birthday.day}/${birthday.month}`;
        const isCurrentUser = birthday.userId === userId;
        return `${isCurrentUser ? '👤 ' : ''}<@${birthday.userId}> • ${formattedDate}`;
      });

      pageEmbed.setDescription(birthdayList.join('\n'));
      pages.push(pageEmbed);
    }

    // Send the first page
    await interaction.editReply({
      embeds: [pages[0]],
      components: totalPages > 1 ? [createPaginationRow(0, totalPages)] : []
    });

    // If there are multiple pages, set up a collector for pagination
    if (totalPages > 1) {
      const filter = i => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 60000
      });

      collector.on('collect', async i => {
        await i.deferUpdate();

        let currentPage = parseInt(i.customId.split('_')[1]);

        if (i.customId === `prev_${currentPage}`) {
          currentPage = Math.max(0, currentPage - 1);
        } else if (i.customId === `next_${currentPage}`) {
          currentPage = Math.min(totalPages - 1, currentPage + 1);
        }

        await i.editReply({
          embeds: [pages[currentPage]],
          components: [createPaginationRow(currentPage, totalPages)]
        });
      });

      collector.on('end', () => {
        interaction.editReply({
          embeds: [pages[0]],
          components: []
        }).catch(() => {});
      });
    }
}

function createPaginationRow(currentPage, totalPages) {
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`prev_${currentPage}`)
        .setLabel('◀️ Anterior')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId(`next_${currentPage}`)
        .setLabel('Próximo ▶️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === totalPages - 1)
    );

    return row;
}

async function handleCheckBirthday(interaction, collection, client) {
    const user = interaction.options.getUser('user');
    const birthday = await collection.findOne({ userId: user.id });

    if (!birthday) {
        return interaction.editReply(`${user.username} não tem um aniversário registado.`);
    }

    const formattedDate = `${birthday.day}/${birthday.month}`;
    const embed = new EmbedBuilder()
        .setTitle('🎂 Informação de Aniversário')
        .setDescription(`O aniversário de ${user.username} é em: **${formattedDate}**`)
        .setColor('#FF69B4')
        .setThumbnail(user.displayAvatarURL({ dynamic: true }));

    await interaction.editReply({ embeds: [embed] });
}

function isValidDate(day, month) {
    // Check if the date is valid
    const daysInMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return day > 0 && day <= daysInMonth[month];
}
