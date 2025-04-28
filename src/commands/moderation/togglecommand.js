const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const commandStateManager = require('../../helpers/commandStateManager');
const { CommandKit } = require('commandkit');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('togglecommand')
        .setDescription('Toggle a command on or off')
        .addStringOption(option =>
            option
                .setName('command')
                .setDescription('The command to toggle')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addBooleanOption(option =>
            option
                .setName('state')
                .setDescription('Enable or disable the command')
                .setRequired(true)
        ),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({ ephemeral: true });

        const commandName = interaction.options.getString('command');
        const newState = interaction.options.getBoolean('state');

        // Check if the command exists
        const allCommands = handler.applicationCommands.map(cmd => cmd.name);

        if (!allCommands.includes(commandName)) {
            return interaction.editReply({
                content: `Command \`${commandName}\` does not exist.`,
                ephemeral: true
            });
        }

        // Skip toggling the current command to prevent locking out
        if (commandName === 'togglecommand') {
            return interaction.editReply({
                content: 'You cannot toggle the `togglecommand` command itself.',
                ephemeral: true
            });
        }

        // Update the command state
        await commandStateManager.setCommandState(commandName, newState);

        const statusEmbed = new EmbedBuilder()
            .setColor(newState ? '#00FF00' : '#FF0000')
            .setTitle('Command Toggle')
            .setDescription(`Command \`${commandName}\` has been ${newState ? 'enabled' : 'disabled'}.`)
            .setTimestamp();

        interaction.editReply({ embeds: [statusEmbed], ephemeral: true });
    },

    autocomplete: async ({ interaction, client, handler }) => {
        const focusedValue = interaction.options.getFocused();
        const allCommands = handler.applicationCommands.map(cmd => cmd.name);

        const filtered = allCommands.filter(cmd =>
            cmd.startsWith(focusedValue) && cmd !== 'togglecommand'
        );

        await interaction.respond(
            filtered.map(cmd => ({ name: cmd, value: cmd })).slice(0, 25)
        );
    },

    options: {
        devOnly: false,
        userPermissions: ['Administrator'],
    },
};
