const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Mostra todos os commandos disponiveis'),

	run: async ({ interaction, client, handler }) => {
		await interaction.deferReply({ ephemeral: true });

		// List of commands categorized (add your commands here)
		const commandCategories = {
			Helpful: [
				{
					name: '/help',
					description: 'Mostra esta mensagem',
					parameters: []
				},
				{
					name: '/info',
					description: 'Informação sobre os Patins no Porto',
					parameters: []
				},
				{
					name: '/invite',
					description: 'Indica-te como podes obter um invite para este Discord',
					parameters: []
				},
			],
			Fun: [
				{
					name: '/coinflip <:new_feature:1243541667076640889> ',
					description: 'Atira uma bitcoin ao ar!',
					parameters: []
				},
				{
					name: '/pokedex',
					description: 'Mostra informação sobre o mundo do Pokémon',
					parameters: [
						{ name: 'pokemon', description: 'nome do Pokémon' }
					]
				},
				{
					name: '/gif',
					description: 'Procura um "random" Gif da vasta internet',
					parameters: [
						{ name: 'prompt', description: 'Palavra para procurar' }
					]
				},
			],
			Utility: [
				{
					name: '/ping',
					description: 'Mostra informações acerca do Bot e do Cliente Discord',
					parameters: []
				},
				{
					name: '/weather <:new_feature:1243541667076640889> ',
					description: 'Verifica como está o tempo',
					parameters: [
						{ name: 'Local', description: 'Local a pesquisar' }
					]
				},
				{
					name: '/forecast <:new_feature:1243541667076640889> ',
					description: 'Obtem a previsão do tempo para um dia específico dos próximos 5 dias',
					parameters: [
						{ name: 'Local', description: 'Local a pesquisar' },
						{ name: 'Dia', description: 'Dia que pretendes' }
					]
				},
				{
					name: 'Flag Translation',
					description: 'Reaje a uma mensagem com a bandeira da lingua que pretendes',
					parameters: []
				},
			],
			Report: [
				{
					name: 'Dá Report numa mensagem',
					description: 'Carrega nas opções da mensagem, menu APPS e reporta a mensagem.',
					parameters: []
				},
				{
					name: '/sugestao',
					description: 'Sugere uma ideia para os Patins no Porto',
					parameters: []
				},
			],
			Bot: [
				{
					name: 'Bot Latency',
					description: `A latência do bot é ${client.ws.ping}ms.`,
					parameters: []
				},
				{
					name: '/botfeedback <a:hiwhoogle:1243541665390657618> ',
					description: 'Diz alguma coisa ao desenvolvedores do Bot 🧙‍♂️',
					parameters: []
				},
				{
					name: 'Support <:server:1243541657711022172> ',
					description: '[Support the Bot](https://supportbotlink.com)',
					parameters: []
				}
			],
			// Add more categories and commands as needed
		};

		const categoryColors = {
			Helpful: '#009933',
			Fun: '#cc00cc',
			Utility: '#ff9900',
			Report: '#990000',
			Bot: '#00ccff'
		};

		const createCategoryEmbed = (category) => {
			const embed = new EmbedBuilder()
				.setTitle(`${category}`)
				.setColor(categoryColors[category] || '#0099ff')
				.setFooter({ text: 'Usa /nomedocomando para executares esse Comando' });

			const commands = commandCategories[category];
			let description = '';
			commands.forEach(command => {
				description += `**${command.name}** - ${command.description}\n`;
				if (command.parameters.length > 0) {
					command.parameters.forEach(param => {
						description += `  • **${param.name}**: ${param.description}\n`;
					});
				}
				description += '\n';
			});

			embed.setDescription(description);
			return embed;
		};

		const categoryButtons = Object.keys(commandCategories).map(category => {
		const commandCategories = {
			Helpful: {
				emoji: '👉',
				style: ButtonStyle.Success
			},
			Fun: {
				emoji: '🦄',
				style: ButtonStyle.Primary
			},
			Utility: {
				emoji: '⚙️',
				style: ButtonStyle.Primary
			},
			Report: {
				emoji: '🪄',
				style: ButtonStyle.Danger
			},
			Bot: {
				emoji: '🤖',
				style: ButtonStyle.Secondary
			},
			// Add more categories as needed
		};

			const { emoji, style } = commandCategories[category];

			return new ButtonBuilder()
				.setCustomId(category)
				.setLabel(`${emoji} ${category}`)
				.setStyle(style)
		});

		const row = new ActionRowBuilder().addComponents(categoryButtons);

		await interaction.editReply({
			content: 'Escolhe a categoria que pretendes ver',
			components: [row]
		});

		const filter = i => i.user.id === interaction.user.id;
		const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

		collector.on('collect', async i => {
			const category = i.customId;
			const embed = createCategoryEmbed(category);
			await i.update({ embeds: [embed], components: [row] });
		});

		collector.on('end', collected => {
			console.log(`Collected ${collected.size} interactions.`);
		});

		 // Log command usage
		 const date = new Date();
		 const dateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
		 const user = interaction.user.tag;
		 const interactionId = interaction.commandName;

		 console.log(`[${dateTime}] User: ${user} | Interaction: ${interactionId}`);
	},
	options: {
		cooldown: '5s',
		//devOnly: true,
		//userPermissions: ['Administrator'],
		//botPermissions: ['BanMembers'],
		//deleted: true,
	},
};
