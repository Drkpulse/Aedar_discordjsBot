const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { getDatabase } = require('../../helpers/mongoClient');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('birthday')
		.setDescription('Gerencia datas de aniversário'),

	run: async ({ interaction, client }) => {
		// Make deferReply ephemeral
		await interaction.deferReply({ ephemeral: true });

		const db = await getDatabase();
		const birthdaysCollection = db.collection('birthdays');

		// Always use the manage interface
		await handleManageBirthday(interaction, birthdaysCollection, client);
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
    } else {
        embed.setDescription('**Não tens nenhuma data de aniversário definida.**\n\nDeseja adicionar a tua data de aniversário para receber felicitações no teu dia especial?');
    }

    // Always show all buttons, just adapt the update/set based on current status
    buttonRow.addComponents(
        new ButtonBuilder()
            .setCustomId(userBirthday ? 'update_birthday' : 'set_birthday')
            .setLabel(userBirthday ? 'Atualizar Data' : 'Definir Aniversário')
            .setStyle(userBirthday ? ButtonStyle.Primary : ButtonStyle.Success)
            .setEmoji(userBirthday ? '📝' : '➕')
    );

    // Only show remove if there's a birthday to remove
    if (userBirthday) {
        buttonRow.addComponents(
            new ButtonBuilder()
                .setCustomId('remove_birthday')
                .setLabel('Remover Data')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️')
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
        try {
            if (i.customId === 'set_birthday' || i.customId === 'update_birthday') {
                // For modal interactions, do NOT stop the collector first
                // and do NOT defer the interaction

                // Create a modal for birthday input
                const modal = new ModalBuilder()
                    .setCustomId(`birthday-modal-${interaction.user.id}`)
                    .setTitle('🎂 Definir Aniversário');

                // Create inputs for day and month
                const dayInput = new TextInputBuilder()
                    .setCustomId('birthday-day')
                    .setLabel('Dia do aniversário (1-31)')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Ex: 15')
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(2);

                const monthInput = new TextInputBuilder()
                    .setCustomId('birthday-month')
                    .setLabel('Mês do aniversário (1-12)')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Ex: 5 (para Maio)')
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(2);

                // Add inputs to action rows
                const firstActionRow = new ActionRowBuilder().addComponents(dayInput);
                const secondActionRow = new ActionRowBuilder().addComponents(monthInput);

                // Add action rows to the modal
                modal.addComponents(firstActionRow, secondActionRow);

                // Show the modal before stopping the collector
                await i.showModal(modal);

                // Now it's safe to stop the collector
                collector.stop('user');

                // Handle the modal response in a separate function
                await handleBirthdayModalResponse(interaction, collection, client);

            } else {
                // For non-modal buttons, defer update first with proper error handling
                try {
                    await i.deferUpdate();
                } catch (err) {
                    console.error('Error deferring update:', err);
                    return; // Don't proceed if we can't defer the update
                }

                if (i.customId === 'remove_birthday') {
                    const userId = interaction.user.id;
                    const result = await collection.deleteOne({ userId });

                    const embedResult = new EmbedBuilder()
                        .setColor(result.deletedCount > 0 ? '#00FF00' : '#FF0000')
                        .setTitle(result.deletedCount > 0 ? '✅ Aniversário Removido' : '❌ Erro')
                        .setDescription(result.deletedCount > 0
                            ? 'A tua data de aniversário foi removida com sucesso.'
                            : 'Não foi encontrada nenhuma data de aniversário para remover.');

                    await interaction.editReply({
                        embeds: [embedResult],
                        components: []
                    });

                    // Return to main menu after removing
                    collector.stop('user');
                    setTimeout(() => {
                        handleManageBirthday(interaction, collection, client);
                    }, 2000);
                } else if (i.customId === 'view_birthdays') {
                    collector.stop('user');
                    await handleListBirthdays(interaction, collection, client);
                }
            }
        } catch (error) {
            console.error('Error handling button interaction:', error);
            // Don't attempt to respond to the interaction if there was an error
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason !== 'messageDelete' && reason !== 'user') {
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

async function handleBirthdayModalResponse(interaction, collection, client) {
    try {
        // Wait for the modal submission
        const filter = (modalInteraction) =>
            modalInteraction.customId === `birthday-modal-${interaction.user.id}`;

        const modalInteraction = await interaction.awaitModalSubmit({
            filter,
            time: 60000
        }).catch(() => null);

        // If user didn't submit the modal
        if (!modalInteraction) {
            const timeoutEmbed = new EmbedBuilder()
                .setTitle('⏰ Tempo Esgotado')
                .setDescription('Não foi recebida nenhuma resposta a tempo.')
                .setColor('#FF0000');

            await interaction.editReply({
                embeds: [timeoutEmbed],
                components: []
            });

            // Return to main menu
            setTimeout(() => {
                handleManageBirthday(interaction, collection, client);
            }, 3000);

            return;
        }

        // Process the submitted values - use deferUpdate for the modal interaction
        await modalInteraction.deferUpdate().catch(() => {});

        const dayValue = modalInteraction.fields.getTextInputValue('birthday-day');
        const monthValue = modalInteraction.fields.getTextInputValue('birthday-month');

        // Convert to integers
        const selectedDay = parseInt(dayValue, 10);
        const selectedMonth = parseInt(monthValue, 10);

        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        // Validate the date
        if (!isValidDate(selectedDay, selectedMonth) ||
            isNaN(selectedDay) ||
            isNaN(selectedMonth) ||
            selectedDay < 1 ||
            selectedDay > 31 ||
            selectedMonth < 1 ||
            selectedMonth > 12) {

            const invalidEmbed = new EmbedBuilder()
                .setTitle('❌ Data Inválida')
                .setDescription('Por favor, introduz uma data válida.')
                .setColor('#FF0000');

            await interaction.editReply({
                embeds: [invalidEmbed],
                components: []
            });

            // After showing error, return to main menu
            setTimeout(() => {
                handleManageBirthday(interaction, collection, client);
            }, 3000);

            return;
        }

        // Save the birthday
        const userId = interaction.user.id;
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

        await interaction.editReply({
            embeds: [successEmbed],
            components: []
        });

        // Return to the main menu after successful update
        setTimeout(() => {
            handleManageBirthday(interaction, collection, client);
        }, 2000);

    } catch (error) {
        console.error('Error in birthday modal response:', error);

        const errorEmbed = new EmbedBuilder()
            .setTitle('❌ Erro')
            .setDescription('Ocorreu um erro ao processar o pedido. Por favor, tente novamente mais tarde.')
            .setColor('#FF0000');

        await interaction.editReply({
            embeds: [errorEmbed],
            components: []
        }).catch(() => {});

        setTimeout(() => {
            handleManageBirthday(interaction, collection, client);
        }, 3000);
    }
}

async function handleBirthdaySet(interaction, i, collection, client) {
    try {
        // Create a modal for birthday input
        const modal = new ModalBuilder()
            .setCustomId(`birthday-modal-${interaction.user.id}`)
            .setTitle('🎂 Definir Aniversário');

        // Create inputs for day and month
        const dayInput = new TextInputBuilder()
            .setCustomId('birthday-day')
            .setLabel('Dia do aniversário (1-31)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 15')
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(2);

        const monthInput = new TextInputBuilder()
            .setCustomId('birthday-month')
            .setLabel('Mês do aniversário (1-12)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 5 (para Maio)')
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(2);

        // Add inputs to action rows
        const firstActionRow = new ActionRowBuilder().addComponents(dayInput);
        const secondActionRow = new ActionRowBuilder().addComponents(monthInput);

        // Add action rows to the modal
        modal.addComponents(firstActionRow, secondActionRow);

        // Show the modal
        await i.showModal(modal);

        // Wait for the modal submission
        const filter = (modalInteraction) =>
            modalInteraction.customId === `birthday-modal-${interaction.user.id}`;

        const modalInteraction = await interaction.awaitModalSubmit({
            filter,
            time: 60000
        }).catch(() => null);

        // If user didn't submit the modal
        if (!modalInteraction) {
            const timeoutEmbed = new EmbedBuilder()
                .setTitle('⏰ Tempo Esgotado')
                .setDescription('Não foi recebida nenhuma resposta a tempo.')
                .setColor('#FF0000');

            await interaction.editReply({
                embeds: [timeoutEmbed],
                components: []
            });

            // Return to main menu
            setTimeout(() => {
                handleManageBirthday(interaction, collection, client);
            }, 3000);

            return;
        }

        // Process the submitted values
        await modalInteraction.deferUpdate().catch(() => {});

        const dayValue = modalInteraction.fields.getTextInputValue('birthday-day');
        const monthValue = modalInteraction.fields.getTextInputValue('birthday-month');

        // Convert to integers
        const selectedDay = parseInt(dayValue, 10);
        const selectedMonth = parseInt(monthValue, 10);

        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        // Validate the date
        if (!isValidDate(selectedDay, selectedMonth) ||
            isNaN(selectedDay) ||
            isNaN(selectedMonth) ||
            selectedDay < 1 ||
            selectedDay > 31 ||
            selectedMonth < 1 ||
            selectedMonth > 12) {

            const invalidEmbed = new EmbedBuilder()
                .setTitle('❌ Data Inválida')
                .setDescription('Por favor, introduz uma data válida.')
                .setColor('#FF0000');

            await interaction.editReply({
                embeds: [invalidEmbed],
                components: []
            });

            // After showing error, return to main menu
            setTimeout(() => {
                handleManageBirthday(interaction, collection, client);
            }, 3000);

            return;
        }

        // Save the birthday
        const userId = interaction.user.id;
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

        await interaction.editReply({
            embeds: [successEmbed],
            components: []
        });

        // Return to the main menu after successful update
        setTimeout(() => {
            handleManageBirthday(interaction, collection, client);
        }, 2000);

    } catch (error) {
        console.error('Error in birthday set process:', error);

        const errorEmbed = new EmbedBuilder()
            .setTitle('❌ Erro')
            .setDescription('Ocorreu um erro ao processar o pedido. Por favor, tente novamente mais tarde.')
            .setColor('#FF0000');

        await interaction.editReply({
            embeds: [errorEmbed],
            components: []
        }).catch(() => {});

        setTimeout(() => {
            handleManageBirthday(interaction, collection, client);
        }, 3000);
    }
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
    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🎂 Aniversários')
          .setDescription('Não existem aniversários registados.')
          .setColor('#FF69B4')
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('back_to_menu')
            .setLabel('Voltar ao Menu')
            .setStyle(ButtonStyle.Secondary)
        )
      ]
    });
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
      .setFooter({ text: `Página ${i + 1}/${totalPages} • Adiciona o teu usando /birthday` });

    const birthdayList = pageItems.map(birthday => {
      const formattedDate = `${birthday.day}/${birthday.month}`;
      const isCurrentUser = birthday.userId === userId;
      return `${isCurrentUser ? '👤 ' : ''}<@${birthday.userId}> • ${formattedDate}`;
    });

    pageEmbed.setDescription(birthdayList.join('\n'));
    pages.push(pageEmbed);
  }

  // Create navigation and action buttons
  const paginationRow = createPaginationRow(0, totalPages);

  // Add action buttons row
  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('back_to_menu')
      .setLabel('Voltar ao Menu')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('refresh_list')
      .setLabel('Atualizar Lista')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🔄')
  );

  // Determine components based on number of pages
  const components = totalPages > 1
    ? [paginationRow, actionRow]
    : [actionRow];

  // Send the first page
  await interaction.editReply({
    embeds: [pages[0]],
    components: components
  });

  // Set up a collector for pagination and actions
  const filter = i => i.user.id === interaction.user.id;
  const collector = interaction.channel.createMessageComponentCollector({
    filter,
    time: 60000
  });

  collector.on('collect', async i => {
    // Always handle errors properly for each interaction
    try {
        // Only attempt to defer update if it's a button press that's not showing a modal
        if (!i.customId.includes('birthday-modal')) {
            try {
                await i.deferUpdate();
            } catch (err) {
                console.error('Error deferring update:', err);
                return; // Skip further processing if we can't defer
            }
        }

        // Handle pagination
        if (i.customId.startsWith('prev_') || i.customId.startsWith('next_')) {
            const currentPage = parseInt(i.customId.split('_')[1]);
            let newPage = currentPage;

            if (i.customId.startsWith('prev_')) {
                newPage = Math.max(0, currentPage - 1);
            } else if (i.customId.startsWith('next_')) {
                newPage = Math.min(totalPages - 1, currentPage + 1);
            }

            await interaction.editReply({
                embeds: [pages[newPage]],
                components: totalPages > 1
                    ? [createPaginationRow(newPage, totalPages), actionRow]
                    : [actionRow]
            });
        }
        // Handle back to menu button
        else if (i.customId === 'back_to_menu') {
            collector.stop('user');
            await handleManageBirthday(interaction, collection, client);
        }
        // Handle refresh list button
        else if (i.customId === 'refresh_list') {
            collector.stop('user');
            await handleListBirthdays(interaction, collection, client);
        }
    } catch (error) {
        console.error('Error handling button interaction:', error);
        // Don't try to respond again if there was an error
    }
  });

  collector.on('end', (collected, reason) => {
    if (reason !== 'messageDelete') {
      // Try updating the message if it still exists and wasn't managed by another action
      interaction.editReply({
        embeds: [pages[0]],
        components: []
      }).catch(() => {
        // Ignore errors if the message can't be edited
      });
    }
  });
}

function createPaginationRow(currentPage, totalPages) {
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
