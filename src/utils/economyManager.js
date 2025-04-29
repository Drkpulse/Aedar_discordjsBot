const { getDatabase } = require('../helpers/mongoClient');

/**
 * Manages user economy transactions and balance operations using MongoDB
 */
const economyManager = {
    /**
     * Get the balance of a user
     * @param {string} userId - Discord user ID
     * @returns {Promise<number>} - User's current balance
     */
    getBalance: async (userId) => {
        try {
            const db = await getDatabase();
            const users = db.collection('users');

            const user = await users.findOne({ userId });
            if (!user) {
                // If user doesn't exist yet, create them with 0 balance
                await users.insertOne({
                    userId,
                    balance: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                return 0;
            }
            return user.balance || 0;
        } catch (error) {
            console.error('Error getting balance:', error);
            throw new Error('Failed to retrieve balance');
        }
    },

    /**
     * Add an amount to a user's balance
     * @param {string} userId - Discord user ID
     * @param {number} amount - Amount to add (positive number)
     * @returns {Promise<number>} - New balance
     */
    addBalance: async (userId, amount) => {
        try {
            if (amount <= 0) throw new Error('Amount must be positive');

            const db = await getDatabase();
            const users = db.collection('users');

            // Use findOneAndUpdate with upsert to create if not exists
            const result = await users.findOneAndUpdate(
                { userId },
                {
                    $inc: { balance: amount },
                    $setOnInsert: { createdAt: new Date() },
                    $set: { updatedAt: new Date() }
                },
                {
                    upsert: true,
                    returnDocument: 'after'
                }
            );

            return result.value.balance;
        } catch (error) {
            console.error('Error adding balance:', error);
            throw new Error('Failed to add balance');
        }
    },

    /**
     * Remove an amount from a user's balance
     * @param {string} userId - Discord user ID
     * @param {number} amount - Amount to remove (positive number)
     * @returns {Promise<number>} - New balance
     */
    removeBalance: async (userId, amount) => {
        try {
            if (amount <= 0) throw new Error('Amount must be positive');

            const db = await getDatabase();
            const users = db.collection('users');

            const user = await users.findOne({ userId });
            if (!user) {
                throw new Error('User not found');
            }

            if ((user.balance || 0) < amount) {
                throw new Error('Insufficient balance');
            }

            const result = await users.findOneAndUpdate(
                { userId },
                {
                    $inc: { balance: -amount },
                    $set: { updatedAt: new Date() }
                },
                { returnDocument: 'after' }
            );

            return result.value.balance;
        } catch (error) {
            console.error('Error removing balance:', error);
            throw error;
        }
    },

    /**
     * Set a user's balance to a specific amount
     * @param {string} userId - Discord user ID
     * @param {number} amount - New balance amount
     * @returns {Promise<number>} - New balance
     */
    setBalance: async (userId, amount) => {
        try {
            if (amount < 0) throw new Error('Amount cannot be negative');

            const db = await getDatabase();
            const users = db.collection('users');

            const result = await users.findOneAndUpdate(
                { userId },
                {
                    $set: {
                        balance: amount,
                        updatedAt: new Date()
                    },
                    $setOnInsert: { createdAt: new Date() }
                },
                {
                    upsert: true,
                    returnDocument: 'after'
                }
            );

            return result.value.balance;
        } catch (error) {
            console.error('Error setting balance:', error);
            throw new Error('Failed to set balance');
        }
    },

    /**
     * Transfer balance from one user to another
     * @param {string} fromUserId - Sender's Discord user ID
     * @param {string} toUserId - Recipient's Discord user ID
     * @param {number} amount - Amount to transfer
     * @returns {Promise<Object>} - Object containing both users' new balances
     */
    transferBalance: async (fromUserId, toUserId, amount) => {
        try {
            if (amount <= 0) throw new Error('Amount must be positive');
            if (fromUserId === toUserId) throw new Error('Cannot transfer to yourself');

            const db = await getDatabase();
            const users = db.collection('users');

            // Check if sender has enough balance
            const fromUser = await users.findOne({ userId: fromUserId });
            if (!fromUser) throw new Error('Sender not found');
            if ((fromUser.balance || 0) < amount) throw new Error('Insufficient balance');

            // Perform the transfer as a transaction (session)
            const session = client.startSession();
            let fromBalance, toBalance;

            try {
                await session.withTransaction(async () => {
                    // Remove from sender
                    const fromResult = await users.findOneAndUpdate(
                        { userId: fromUserId },
                        {
                            $inc: { balance: -amount },
                            $set: { updatedAt: new Date() }
                        },
                        {
                            session,
                            returnDocument: 'after'
                        }
                    );

                    // Add to recipient
                    const toResult = await users.findOneAndUpdate(
                        { userId: toUserId },
                        {
                            $inc: { balance: amount },
                            $setOnInsert: { createdAt: new Date() },
                            $set: { updatedAt: new Date() }
                        },
                        {
                            upsert: true,
                            session,
                            returnDocument: 'after'
                        }
                    );

                    fromBalance = fromResult.value.balance;
                    toBalance = toResult.value.balance;
                });
            } finally {
                await session.endSession();
            }

            return {
                fromBalance,
                toBalance
            };
        } catch (error) {
            console.error('Error transferring balance:', error);
            throw error;
        }
    },

    /**
     * Get leaderboard of users with highest balances
     * @param {number} limit - Number of users to return
     * @returns {Promise<Array>} - Array of users with their balances
     */
    getLeaderboard: async (limit = 10) => {
        try {
            const db = await getDatabase();
            const users = db.collection('users');

            const topUsers = await users.find()
                .sort({ balance: -1 })
                .limit(limit)
                .toArray();

            return topUsers;
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            throw new Error('Failed to retrieve leaderboard');
        }
    },

    /**
     * Update the last work time for a user
     * @param {string} userId - Discord user ID
     * @returns {Promise<Date>} - Updated work time
     */
    updateWorkTime: async (userId) => {
        try {
            const db = await getDatabase();
            const users = db.collection('users');

            const now = new Date();
            const result = await users.findOneAndUpdate(
                { userId },
                {
                    $set: {
                        lastWorkTime: now,
                        updatedAt: now
                    },
                    $setOnInsert: {
                        balance: 0,
                        createdAt: now
                    }
                },
                {
                    upsert: true,
                    returnDocument: 'after'
                }
            );

            return result.value.lastWorkTime;
        } catch (error) {
            console.error('Error updating work time:', error);
            throw new Error('Failed to update work time');
        }
    },

    /**
     * Get the last work time for a user
     * @param {string} userId - Discord user ID
     * @returns {Promise<Date|null>} - Last work time or null if never worked
     */
    getLastWorkTime: async (userId) => {
        try {
            const db = await getDatabase();
            const users = db.collection('users');

            const user = await users.findOne({ userId });
            return user?.lastWorkTime || null;
        } catch (error) {
            console.error('Error getting last work time:', error);
            throw new Error('Failed to get last work time');
        }
    },

    /**
     * Update the last daily claim time for a user
     * @param {string} userId - Discord user ID
     * @returns {Promise<Date>} - Updated daily claim time
     */
    updateDailyClaimTime: async (userId) => {
        try {
            const db = await getDatabase();
            const users = db.collection('users');

            const now = new Date();
            const result = await users.findOneAndUpdate(
                { userId },
                {
                    $set: {
                        lastDailyClaimTime: now,
                        updatedAt: now
                    },
                    $setOnInsert: {
                        balance: 0,
                        createdAt: now
                    }
                },
                {
                    upsert: true,
                    returnDocument: 'after'
                }
            );

            return result.value.lastDailyClaimTime;
        } catch (error) {
            console.error('Error updating daily claim time:', error);
            throw new Error('Failed to update daily claim time');
        }
    },

    /**
     * Get the last daily claim time for a user
     * @param {string} userId - Discord user ID
     * @returns {Promise<Date|null>} - Last daily claim time or null if never claimed
     */
    getLastDailyClaimTime: async (userId) => {
        try {
            const db = await getDatabase();
            const users = db.collection('users');

            const user = await users.findOne({ userId });
            return user?.lastDailyClaimTime || null;
        } catch (error) {
            console.error('Error getting last daily claim time:', error);
            throw new Error('Failed to get last daily claim time');
        }
    }
};

module.exports = economyManager;
