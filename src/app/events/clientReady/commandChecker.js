import { getDatabase } from '../../../helpers/mongoClient.js';
import { loadCommandStates } from '../../../helpers/commandManager.js';
import { getLoadedCommands } from '../../../helpers/commandRegistry.js';

// clientReady passes the client as its own argument, then CommandKit adds (client, commandkit).
export default async (readyClient, client, commandkit) => {
    console.log(`\x1b[36m╭─────────────────────────────────────\x1b[37m`);
    console.log(`\x1b[36m│ \x1b[34mInitializing Command System\x1b[37m`);

    try {
        // Get database connection
        const db = await getDatabase();
        console.log(`\x1b[36m│ \x1b[32m✓ Connected to MongoDB\x1b[37m`);

        // Load command states from database
        const startTime = Date.now();
        await loadCommandStates(db);
        const loadTime = Date.now() - startTime;

        // Count how many command settings were loaded
        const collection = db.collection('commandSettings');
        const settingsCount = await collection.countDocuments();

        console.log(`\x1b[36m│ \x1b[32m✓ Loaded ${settingsCount} command settings in ${loadTime}ms\x1b[37m`);

        // Log available commands
        const commands = getLoadedCommands(commandkit);
        if (commands.length) {
            const activeCommands = commands.filter(cmd => cmd.options.isActive !== false).length;

            console.log(`\x1b[36m│ \x1b[33m→ Total Commands: ${commands.length}\x1b[37m`);
            console.log(`\x1b[36m│ \x1b[33m→ Globally Active: ${activeCommands}\x1b[37m`);
            console.log(`\x1b[36m│ \x1b[33m→ Server Specific: ${settingsCount}\x1b[37m`);
        } else {
            console.log(`\x1b[36m│ \x1b[33m→ Command handler not available yet\x1b[37m`);
            console.log(`\x1b[36m│ \x1b[33m→ Server Specific: ${settingsCount}\x1b[37m`);
        }

    } catch (error) {
        console.error(`\x1b[36m│ \x1b[31m✗ Error initializing command system:\x1b[37m`, error);
    }

    console.log(`\x1b[36m╰─────────────────────────────────────\x1b[37m\n`);
};

// Helper function to format command counts for display
function formatCommandCounts(commands) {
    const categories = {};

    commands.forEach(cmd => {
        const category = cmd.category || 'Uncategorized';
        if (!categories[category]) {
            categories[category] = 0;
        }
        categories[category]++;
    });

    return Object.entries(categories)
        .map(([category, count]) => `${category}: ${count}`)
        .join(', ');
}
