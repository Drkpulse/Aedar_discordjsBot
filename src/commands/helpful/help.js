const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available commands with descriptions and parameters'),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({ ephemeral: true });

        // List of commands categorized (add your commands here)
        const commandCategories = {
            Helpful: [
                {
                    name: 'help',
                    description: 'Mostra esta mensagem',
                    parameters: []
                },
                {
                    name: 'info',
                    description: 'Informação sobre os Patins no Porto',
                    parameters: []
                },
                {
                    name: 'invite',
                    description: 'Indica-te como podes obter um invite para este Discord',
                    parameters: []
                },
            ],
            Fun: [
                {
                    name: 'coinflip',
                    description: 'Atira uma bitcoin ao ar!',
                    parameters: []
                },
                {
                    name: 'pokedex',
                    description: 'Mostra informação sobre o mundo do Pokémon',
                    parameters: [
						{ name: 'pokemon', description: 'nome do Pokémon' }
					]
                },
                {
                    name: 'gif',
                    description: 'Procura um "random" Gif da vasta internet',
                    parameters: [
						{ name: 'prompt', description: 'Palavra para procurar' }
					]
                },
            ],
            Utility: [
                {
                    name: 'ping',
                    description: 'Mostra informações acerca do Bot e do Cliente Discord',
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
                    name: 'sugestao',
                    description: 'Sugere uma ideia para os Patins no Porto',
                    parameters: []
                },
                {
                    name: 'botfeedback',
                    description: 'Diz alguma coisa ao desenvolvedores do Bot 🧙‍♂️',
                    parameters: []
                },
            ],
            // Add more categories and commands as needed
        };



        const createCategoryEmbed = (category) => {
            const embed = new EmbedBuilder()
                .setTitle(`${category} Comandos`)
                .setColor('#0099ff')
                .setFooter({ text: 'Usa /nomedocomando para executares esse Comando' });

            const commands = commandCategories[category];
            let description = '';
            commands.forEach(command => {
                description += `**/${command.name}** - ${command.description}\n`;
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
		// Add emojis to button labels
		let emoji;
		switch (category) {
			case 'Helpful':
				emoji = '👉';
				break;
			case 'Fun':
				emoji = '🪅';
				break;
			case 'Utility':
				emoji = '⚙️';
				break;
			case 'Report':
				emoji = '🪄';
				break;
			// Add more cases for other categories if needed
			default:
				emoji = '💩';
		}
            return new ButtonBuilder()
                .setCustomId(category)
                .setLabel(`${emoji} ${category}`)
                .setStyle(ButtonStyle.Primary);
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
        devOnly: true,
        //userPermissions: ['Administrator'],
        //botPermissions: ['BanMembers'],
        //deleted: true,
    },
};
