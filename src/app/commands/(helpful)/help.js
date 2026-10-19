import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

export const command = new SlashCommandBuilder()
	.setName('help')
	.setDescription('Mostra todos os commandos disponiveis').toJSON();

export const chatInput = async ({ interaction, client }) => {
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
				name: '/coinflip <:UPDATE:1311443671773741108> ',
				description: 'Atira uma bitcoin ao ar!',
				parameters: []
			},
			{
				name: '/pokedex',
				description: 'Mostra informação sobre o mundo do <a:pokeball:1244057132232478770> Pokémon',
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
			{
				name: '/blackjack <:new_badge:1311442095051116666> ',
				description: 'Joga Blackjack contra o Bot',
				parameters: []
			},
			{
				name: '/eightball <:new_badge:1311442095051116666> ',
				description: 'Faz uma pergunta e a 8ball responde!',
				parameters: [
					{ name: 'Pergunta', description: 'Questão que queres colocar' }
				]
			},
			{
				name: '/yesno <:new_badge:1311442095051116666> ',
				description: 'Recebe uma resposta aleatória de "sim" ou "não"',
				parameters: []
			},
			{
				name: '/rps <:new_badge:1311442095051116666> ',
				description: 'Joga Pedra, Papel ou Tesoura contra o Bot ou contra outro jogador',
				parameters: [
					{ name: 'Jogador', description: 'Jogador que queres jogar contra' }
				]
			},
			{
				name: '/slots <:new_badge:1311442095051116666> ',
				description: 'Aposta moedas nas slots: dois iguais pagam x2, três iguais x10',
				parameters: [
					{ name: 'bet', description: 'Moedas a apostar' }
				]
			},
			{
				name: '/roulette <:new_badge:1311442095051116666> ',
				description: 'Aposta moedas na roleta: número paga x36, cor ou par/ímpar x2',
				parameters: [
					{ name: 'bet', description: 'Número (0-36), vermelho, preto, par ou impar' },
					{ name: 'amount', description: 'Moedas a apostar' }
				]
			},
			{
				name: '/hilo <:new_badge:1311442095051116666> ',
				description: 'Adivinha se a próxima carta é maior ou menor e levanta quando quiseres',
				parameters: [
					{ name: 'bet', description: 'Moedas a apostar' }
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
				name: '/weather <:UPDATE:1311443671773741108> ',
				description: 'Verifica como está o tempo',
				parameters: [
					{ name: 'Local', description: 'Local a pesquisar' }
				]
			},
			{
				name: '/forecast <:UPDATE:1311443671773741108> ',
				description: 'Obtem a previsão do tempo para um dia específico dos próximos 5 dias',
				parameters: [
					{ name: 'Local', description: 'Local a pesquisar' },
					{ name: 'Dia', description: 'Dia que pretendes' }
				]
			},
			{
				name: '<:googletranslate:1244058891298410587> Flag Translation',
				description: 'React with the flag you want to translate the message to',
				parameters: []
			},
		],
		Report: [
			{
				name: '<:reportmessage:1244055410445385800> Dá Report numa mensagem <:reportmessage:1244055410445385800> ',
				description: 'Carrega nas opções da mensagem, menu APPS e reporta a mensagem.',
				parameters: []
			},
			{
				name: '/sugestao',
				description: 'Sugere uma ideia <a:uau:759825999495561218> para os Patins no Porto',
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
				name: '/botfeedback ',
				description: 'Diz <a:hiwhoogle:1243541665390657618> alguma coisa ao desenvolvedores do Bot 🧙‍♂️',
				parameters: []
			},
			{
				name: 'Server <:server:1243541657711022172> ',
				description: 'Obrigado por usarem o Bot',
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
			.setFooter({ text: 'Usa ** /nomedocomando ** para usar esse Comando' });

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
		collector.resetTimer();
		const category = i.customId;
		const embed = createCategoryEmbed(category);
		await i.update({ embeds: [embed], components: [row] });
	});

	collector.on('end', collected => {
		console.log(`Collected ${collected.size} interactions.`);
	});
};

export const options = {
	cooldown: '5s',
};
