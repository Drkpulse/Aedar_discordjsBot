const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getDatabase } = require('../../events/ready/mongoClient');

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
		await interaction.deferReply();

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

	// Create embed
	const embed = new EmbedBuilder()
		.setTitle('🎂 Próximos Aniversários')
		.setColor('#FF69B4')
		.setFooter({ text: 'Adiciona o teu usando /birthday add' });

	const birthdayList = birthdays.slice(0, 10).map(birthday => {
		const formattedDate = `${birthday.day}/${birthday.month}`;
		return `<@${birthday.userId}> • ${formattedDate}`;
	});

	embed.setDescription(birthdayList.join('\n'));
	await interaction.editReply({ embeds: [embed] });
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
