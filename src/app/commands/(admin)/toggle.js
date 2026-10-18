import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getDatabase } from '../../../helpers/mongoClient.js';
import { setCommandState } from '../../../helpers/commandManager.js';
import { getLoadedCommands, findLoadedCommand } from '../../../helpers/commandRegistry.js';

export const command = new SlashCommandBuilder()
    .setName('toggle')
    .setDescription('Enable or disable a command for this server')
    .addStringOption(option =>
        option.setName('command')
            .setDescription('The command to toggle')
            .setRequired(true)
            .setAutocomplete(true))
    .addBooleanOption(option =>
        option.setName('status')
            .setDescription('Enable or disable the command')
            .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator).toJSON();

export const autocomplete = async ({ interaction, commandkit }) => {
    try {
        // Get focused option value
        const focusedOption = interaction.options.getFocused(true);

        // Only process autocomplete for "command" option
        if (focusedOption.name !== 'command') return;

        const focusedValue = focusedOption.value.toLowerCase();

        // Commands loaded by CommandKit that match what the user typed
        const filteredCommands = getLoadedCommands(commandkit)
            .filter(cmd => cmd.name.toLowerCase().includes(focusedValue))
            .slice(0, 25)
            .map(cmd => ({ name: cmd.name, value: cmd.name }));

        // Respond with the filtered commands or a "no results" message
        if (filteredCommands.length === 0) {
            return await interaction.respond([
                { name: 'No matching commands found', value: 'none' }
            ]);
        }

        await interaction.respond(filteredCommands);
    } catch (error) {
        console.error('Error in autocomplete function:', error);
        // Try to respond even in case of error
        try {
            await interaction.respond([
                { name: 'Error processing command list', value: 'error' }
            ]);
        } catch (respondError) {
            console.error('Failed to send autocomplete response:', respondError);
        }
    }
};

export const chatInput = async ({ interaction, commandkit }) => {
    await interaction.deferReply();

    try {
        const commandName = interaction.options.getString('command');
        const enabled = interaction.options.getBoolean('status');
        const guildId = interaction.guild.id;

        // Verify the command exists
        if (!findLoadedCommand(commandkit, commandName)) {
            return interaction.editReply({
                content: `❌ O comando \`${commandName}\` não existe.`,
            });
        }

        // Get database reference
        const db = await getDatabase();
        const collection = db.collection('commandSettings');

        // Update or insert command settings
        await collection.updateOne(
            { guildId, commandName },
            { $set: { enabled, updatedAt: new Date() } },
            { upsert: true }
        );

        // Update the in-memory state for this guild
        setCommandState(`${commandName}-${guildId}`, enabled);

        const statusText = enabled ? 'ativado' : 'desativado';
        await interaction.editReply({
            content: `✅ O comando \`${commandName}\` foi ${statusText} para este servidor.`
        });
    } catch (error) {
        console.error('Error in toggle command execution:', error);
        await interaction.editReply({
            content: '❌ Ocorreu um erro ao alterar o estado do comando. Tente novamente mais tarde.',
            ephemeral: true
        });
    }
};

export const options = {
    cooldown: '5s',
    isActive: true,
    isAdmin: true,
};
