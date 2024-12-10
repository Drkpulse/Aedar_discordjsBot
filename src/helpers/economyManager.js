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

    // Create a new account with a starting balance
    async createAccount(userId) {
        const initialBalance = 100;
        await this.collection.insertOne({ userId, balance: initialBalance });
        await this.logTransaction(userId, initialBalance, 'Account Created');
        return initialBalance; // Return the initial balance
    }

    // Log a transaction
    async logTransaction(userId, amount, type) {
        const transaction = {
            userId,
            amount,
            type,
            date: new Date(),
        };
        await this.transactionCollection.insertOne(transaction);
    }

    // Add amount to a user's balance
    async addBalance(userId, amount) {
        if (amount <= 0) {
            throw new Error("Amount must be greater than zero.");
        }
        await this.collection.updateOne(
            { userId },
            { $inc: { balance: amount } },
            { upsert: true } // Create a new document if it doesn't exist
        );
        await this.logTransaction(userId, amount, 'Balance Added');
    }

    // Remove amount from a user's balance
    async removeBalance(userId, amount) {
        if (amount <= 0) {
            throw new Error("Amount must be greater than zero.");
        }
        const result = await this.collection.findOneAndUpdate(
            { userId, balance: { $gte: amount } },
            { $inc: { balance: -amount } },
            { returnOriginal: false }
        );

        if (!result.value) {
            throw new Error("Insufficient balance or user not found.");
        }
        await this.logTransaction(userId, -amount, 'Balance Removed');
    }

    // Set a user's balance to a specific amount
    async setBalance(userId, amount) {
        if (amount < 0) {
            throw new Error("Balance cannot be negative.");
        }
        await this.collection.updateOne(
            { userId },
            { $set: { balance: amount } },
            { upsert: true } // Create a new document if it doesn't exist
        );
        await this.logTransaction(userId, amount, 'Balance Set');
    }

    // Get a user's balance, creating an account if not found
    async getBalance(userId) {
        const user = await this.collection.findOne({ userId });
        if (!user) {
            // If user does not exist, create an account
            return await this.createAccount(userId);
        }
        return user.balance; // Return the existing balance
    }
}


module.exports = createEconomyManager;
