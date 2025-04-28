// Export an instance of the EconomyManager with the voidBank and transaction collections
const { getDatabase } = require('./mongoClient'); // Adjust the import based on your setup

async function createEconomyManager() {
    const db = await getDatabase();
    const voidBankCollection = db.collection('voidBank');
    const transactionCollection = db.collection('transactions'); // Collection for logging transactions
    return new EconomyManager(voidBankCollection, transactionCollection);
}

class EconomyManager {
    constructor(collection, transactionCollection) {
        this.collection = collection; // MongoDB collection for user balances
        this.transactionCollection = transactionCollection; // MongoDB collection for transactions
    }

    // Create a new account with starting balances
    async createAccount(userId) {
        const initialBalances = { bronze: 100, silver: 0, gold: 0 };
        await this.collection.insertOne({ userId, balances: initialBalances });
        await this.logTransaction(userId, initialBalances.bronze, 'Account Created', 'bronze');
        return initialBalances; // Return the initial balances
    }

    // Log a transaction
    async logTransaction(userId, amount, type, currency) {
        const transaction = {
            userId,
            amount,
            type,
            currency,
            date: new Date(),
        };
        await this.transactionCollection.insertOne(transaction);
    }

    // Add amount to a user's balance
    async addBalance(userId, amount, currency) {
        if (amount <= 0) {
            throw new Error("Amount must be greater than zero.");
        }
        const conversionRate = this.getConversionRate(currency);
        const amountInBronze = amount * conversionRate;

        await this.collection.updateOne(
            { userId },
            { $inc: { [`balances.${currency}`]: amount } },
            { upsert: true } // Create a new document if it doesn't exist
        );
        await this.logTransaction(userId, amountInBronze, 'Balance Added', currency);
    }

    // Remove amount from a user's balance
    async removeBalance(userId, amount, currency) {
        if (amount <= 0) {
            throw new Error("Amount must be greater than zero.");
        }
        const conversionRate = this.getConversionRate(currency);
        const amountInBronze = amount * conversionRate;

        const result = await this.collection.findOneAndUpdate(
            { userId, [`balances.${currency}`]: { $gte: amount } },
            { $inc: { [`balances.${currency}`]: -amount } },
            { returnOriginal: false }
        );

        if (!result.value) {
            throw new Error("Insufficient balance or user not found.");
        }
        await this.logTransaction(userId, -amountInBronze, 'Balance Removed', currency);
    }

    // Set a user's balance to a specific amount
    async setBalance(userId, amount, currency) {
        if (amount < 0) {
            throw new Error("Balance cannot be negative.");
        }
        const conversionRate = this.getConversionRate(currency);
        const amountInBronze = amount * conversionRate;

        await this.collection.updateOne(
            { userId },
            { $set: { [`balances.${currency}`]: amount } },
            { upsert: true } // Create a new document if it doesn't exist
        );
        await this.logTransaction(userId, amountInBronze, 'Balance Set', currency);
    }
    // For Daily Reward
    async getLastDailyClaim(userId) {
        const user = await this.collection.findOne({ userId });
        return user?.lastDailyClaim || null;
    }

    async setLastDailyClaim(userId, date) {
        await this.collection.updateOne(
            { userId },
            { $set: { lastDailyClaim: date } },
            { upsert: true }
        );
    }

    // For Weekly Reward (similar approach)
    async getLastWeeklyClaim(userId) {
        const user = await this.collection.findOne({ userId });
        return user?.lastWeeklyClaim || null;
    }

    async setLastWeeklyClaim(userId, date) {
        await this.collection.updateOne(
            { userId },
            { $set: { lastWeeklyClaim: date } },
            { upsert: true }
        );
    }

    // For Inventory System
    async addItemToInventory(userId, itemId, quantity = 1) {
        await this.collection.updateOne(
            { userId },
            { $inc: { [`inventory.${itemId}`]: quantity } },
            { upsert: true }
        );
    }

    async getInventory(userId) {
        const user = await this.collection.findOne({ userId });
        return user?.inventory || {};
    }
    // Get a user's balance, creating an account if not found
    async getBalance(userId) {
        const user = await this.collection.findOne({ userId });
        if (!user) {
            // If user does not exist, create an account
            return await this.createAccount(userId);
        }
        return user.balances; // Return the existing balances
    }

    // Get top users by balance for a specific currency
    async getTopUsers(currency, limit = 10) {
    const pipeline = [
        { $sort: { [`balances.${currency}`]: -1 } },
        { $limit: limit },
        { $project: {
            userId: 1,
            balance: `$balances.${currency}`,
            _id: 0
        }}
    ];

    return await this.collection.aggregate(pipeline).toArray();
}
    // Get conversion rate to bronze
    getConversionRate(currency) {
        switch (currency) {
            case 'gold':
                return 100; // 1 gold = 100 bronze
            case 'silver':
                return 10; // 1 silver = 10 bronze
            case 'bronze':
            default:
                return 1; // 1 bronze = 1 bronze
        }
    }
}

module.exports = createEconomyManager;
