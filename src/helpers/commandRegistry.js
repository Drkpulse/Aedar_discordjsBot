/**
 * Reads the commands CommandKit has loaded (slash and context menu) and returns them in a simple shape:
 * { name, description, category, options }
 *
 * `category` comes from the `(category)` folder the command file lives in,
 * and `options` is the custom `options` export of the command file (cooldown, isActive, isAdmin, devOnly).
 * @param {import('commandkit').CommandKit} commandkit
 */
export function getLoadedCommands(commandkit) {
	const loaded = commandkit?.commandHandler?.getCommandsArray?.() ?? [];

	const handlers = ['chatInput', 'messageContextMenu', 'userContextMenu'];
	const seen = new Set();

	return loaded
		.filter((cmd) => handlers.some((h) => typeof cmd.data?.[h] === 'function'))
		// context menu commands appear twice in CommandKit's list, keep one
		.filter((cmd) => !seen.has(cmd.data.command.name) && seen.add(cmd.data.command.name))
		.map((cmd) => ({
			name: cmd.data.command.name,
			description: cmd.data.command.description,
			category: cmd.command.category ?? null,
			options: cmd.data.options ?? {},
		}));
}

/**
 * Finds one loaded slash command by name.
 * @param {import('commandkit').CommandKit} commandkit
 * @param {string} name
 */
export function findLoadedCommand(commandkit, name) {
	return getLoadedCommands(commandkit).find((cmd) => cmd.name === name) ?? null;
}
