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
                    name: 'ping',
                    description: 'Pong!',
                    parameters: []
                },
                {
                    name: 'help',
                    description: 'Shows all available commands with descriptions and parameters',
                    parameters: []
                },
            ],
            Fun: [
                {
                    name: 'coinflip',
                    description: 'Flips a coin and shows the result',
                    parameters: []
                },
            ],
            Pokémon: [
                {
                    name: 'pokedex',
                    description: 'Shows Pokemon information',
                    parameters: [
                        { name: 'pokemon', description: 'Pokemon name to get information for' }
                    ]
                },
            ],
            // Add more categories and commands as needed
        };

        const createCategoryEmbed = (category) => {
            const embed = new EmbedBuilder()
                .setTitle(`${category} Commands`)
                .setColor('#0099ff')
                .setFooter({ text: 'Use /command to execute a command' });

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
            return new ButtonBuilder()
                .setCustomId(category)
                .setLabel(category)
                .setStyle(ButtonStyle.Primary);
        });

        const row = new ActionRowBuilder().addComponents(categoryButtons);

        await interaction.editReply({
            content: 'Select a category to view the commands:',
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
        //cooldown: '1h',
        devOnly: true,
        //userPermissions: ['Administrator'],
        //botPermissions: ['BanMembers'],
        //deleted: true,
    },
};
