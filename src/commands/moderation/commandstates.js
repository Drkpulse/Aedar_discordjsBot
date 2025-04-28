const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const commandStateManager = require('../../helpers/commandStateManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commandstates')
        .setDescription('View all command states'),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({ ephemeral: true });

        const allCommandStates = await commandStateManager.getAllCommandStates();
        const allCommands = handler.applicationCommands.map(cmd => cmd.name);

        // Create lists of enabled and disabled commands
        const enabledCommands = [];
        const disabledCommands = [];

        allCommands.forEach(cmd => {
            if (allCommandStates[cmd] === false) {
                disabledCommands.push(cmd);
            } else {
                enabledCommands.push(cmd);
            }
        });

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Command States')
            .setDescription('Current states of all commands')
            .addFields(
                {
                    name: '✅ Enabled Commands',
                    value: enabledCommands.length ? `\`${enabledCommands.join('`\n`')}\`` : 'None'
                },
                {
                    name: '❌ Disabled Commands',
                    value: disabledCommands.length ? `\`${disabledCommands.join('`\n`')}\`` : 'None'
                }
            )
            .setTimestamp();

        interaction.editReply({ embeds: [embed], ephemeral: true });
    },

    options: {
        devOnly: false,
        userPermissions: ['Administrator'],
    },
};
