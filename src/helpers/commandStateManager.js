const { getDatabase } = require('../events/ready/mongoClient');

class CommandStateManager {
    constructor() {
        this.states = new Map();
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            const db = await getDatabase();
            this.collection = db.collection('commandStates');

            // Load all command states from database
            const storedStates = await this.collection.find({}).toArray();

            storedStates.forEach(state => {
                this.states.set(state.commandName, state.isActive);
            });

            this.initialized = true;
            console.log(`Loaded ${storedStates.length} command states from database`);
        } catch (error) {
            console.error('Error initializing CommandStateManager:', error);
        }
    }

    async setCommandState(commandName, isActive) {
        await this.initialize();

        this.states.set(commandName, isActive);

        // Update in database
        await this.collection.updateOne(
            { commandName },
            { $set: { commandName, isActive } },
            { upsert: true }
        );

        return isActive;
    }

    async getCommandState(commandName) {
        await this.initialize();
        return this.states.has(commandName) ? this.states.get(commandName) : true;
    }

    async getAllCommandStates() {
        await this.initialize();
        const result = {};

        for (const [commandName, isActive] of this.states.entries()) {
            result[commandName] = isActive;
        }

        return result;
    }
}

module.exports = new CommandStateManager();
