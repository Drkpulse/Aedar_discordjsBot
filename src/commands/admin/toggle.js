const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getDatabase } = require('../../helpers/mongoClient');
const { setCommandState, isCommandActive } = require('../../helpers/commandManager');

module.exports = {
    data: new SlashCommandBuilder()
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
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    // CommandKit's autocomplete handler expects these parameters
    autocomplete: async ({ interaction, client, handler }) => {
        try {
            // Get focused option value
            const focusedOption = interaction.options.getFocused(true);

            // Only process autocomplete for "command" option
            if (focusedOption.name !== 'command') return;

            const focusedValue = focusedOption.value.toLowerCase();

            // Make sure handler is available
            if (!handler || !handler.commands) {
                console.log('Handler or handler.commands is undefined');
                return await interaction.respond([
                    { name: 'Error: Command handler unavailable', value: 'error' }
                ]);
            }

            // Debug: Log what we have in handler.commands
            console.log('Command handler structure:', {
                type: typeof handler.commands,
                isMap: handler.commands instanceof Map,
                size: typeof handler.commands.size !== 'undefined' ? handler.commands.size : 'N/A',
                hasEntries: typeof handler.commands.entries === 'function',
                hasForEach: typeof handler.commands.forEach === 'function',
                keys: Object.keys(handler.commands).length > 0 ? 'Has keys' : 'No keys',
                firstFewKeys: Object.keys(handler.commands).slice(0, 5)
            });

            // Get all commands that match the filter
            const filteredCommands = [];

            // Directly access the handler's commands as a collection/map
            if (handler.commands.size > 0 && typeof handler.commands.entries === 'function') {
                console.log('Using entries() method to iterate commands');
                for (const [cmdName, cmdObj] of handler.commands.entries()) {
                    console.log(`Found command: ${cmdName}`);
                    if (typeof cmdName === 'string' && cmdName.toLowerCase().includes(focusedValue)) {
                        filteredCommands.push({
                            name: cmdName,
                            value: cmdName
                        });

                        if (filteredCommands.length >= 25) break;
                    }
                }
            }
            // Try using Object.entries if it's a plain object
            else if (Object.keys(handler.commands).length > 0) {
                console.log('Using Object.entries() to iterate commands');
                for (const [key, value] of Object.entries(handler.commands)) {
                    // Skip non-command properties
                    if (key === 'size' || typeof value !== 'object') continue;

                    // Try to get the command name from either the key or the command's data
                    const cmdName = typeof value.data === 'object' && value.data.name
                        ? value.data.name
                        : key;

                    console.log(`Found command via Object.entries: ${cmdName}`);

                    if (cmdName.toLowerCase().includes(focusedValue)) {
                        filteredCommands.push({
                            name: cmdName,
                            value: cmdName
                        });

                        if (filteredCommands.length >= 25) break;
                    }
                }
            }
            // Last resort - try to find commands another way
            else {
                console.log('Command collection is empty or not iterable, trying alternative method');

                // Look for commands in client.application.commands if available
                if (client && client.application && client.application.commands) {
                    const commands = await client.application.commands.fetch();
                    for (const command of commands.values()) {
                        if (command.name.toLowerCase().includes(focusedValue)) {
                            filteredCommands.push({
                                name: command.name,
                                value: command.name
                            });

                            if (filteredCommands.length >= 25) break;
                        }
                    }
                }
            }

            console.log(`Found ${filteredCommands.length} matching commands`);

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
    },

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply();

        try {
            const commandName = interaction.options.getString('command');
            const enabled = interaction.options.getBoolean('status');
            const guildId = interaction.guild.id;

            // Verify the command exists
            let command = null;

            // Try different methods to find the command
            if (handler && handler.commands) {
                if (typeof handler.commands.get === 'function') {
                    command = handler.commands.get(commandName);
                } else {
                    // Check if it's a direct property
                    command = handler.commands[commandName];

                    // If not found, try to find it by scanning all commands
                    if (!command) {
                        for (const [key, value] of Object.entries(handler.commands)) {
                            if (key === 'size' || typeof value !== 'object') continue;

                            const cmdName = typeof value.data === 'object' && value.data.name
                                ? value.data.name
                                : key;

                            if (cmdName === commandName) {
                                command = value;
                                break;
                            }
                        }
                    }
                }
            }

            // If we still haven't found the command, try using the client's commands
            if (!command && client && client.application) {
                try {
                    const commands = await client.application.commands.fetch();
                    const apiCommand = commands.find(cmd => cmd.name === commandName);
                    if (apiCommand) {
                        command = { data: { name: apiCommand.name } };
                    }
                } catch (apiError) {
                    console.error('Error fetching commands from API:', apiError);
                }
            }

            if (!command) {
                return interaction.editReply({
                    content: `❌ O comando \`${commandName}\` não existe.`,
                    ephemeral: true
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
    },

    options: {
        cooldown: '5s',
        isActive: true,
        isAdmin: true,
    },
};
