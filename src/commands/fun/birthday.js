const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
						.setRequired(true))),


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
	}
},
options: {
	cooldown: '10s',
},
};

async function handleAddBirthday(interaction, collection) {
	const userId = interaction.user.id;
	const day = interaction.options.getInteger('dia');
	const month = interaction.options.getInteger('mes');

	// Validate date
	if (!isValidDate(day, month)) {
		return interaction.editReply('❌ Data inválida. Por favor, insira uma data válida.');
	}

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
	await interaction.editReply(`✅ Aniversário adicionado: ${date}`);
}

async function handleRemoveBirthday(interaction, collection) {
	const userId = interaction.user.id;
	const result = await collection.deleteOne({ userId });

	if (result.deletedCount > 0) {
		await interaction.editReply('✅ A tua data de aniversário foi removida.');
	} else {
		await interaction.editReply('❌ Não foi encontrada nenhuma data de aniversário para remover.');
	}
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
		.setFooter({ text: `Página ${i + 1}/${totalPages} • Adiciona o teu usando /birthday add` });

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
	await interaction.editReply(`O aniversário de ${user.username} é em: **${formattedDate}** 🎂`);
}

function isValidDate(day, month) {
	// Check if the date is valid
	const daysInMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	return day > 0 && day <= daysInMonth[month];
}
