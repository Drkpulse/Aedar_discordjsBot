import { MongoClient } from 'mongodb';

// MongoDB pooling options
const poolOptions = {
	maxPoolSize: 10,
	minPoolSize: 2,
	maxIdleTimeMS: 30000,
	waitQueueTimeoutMS: 5000,
};

// The client is created on first use, so a missing MONGO_URI doesn't stop the whole bot from starting.
let client;
let dbInstance;

function getMongoClient() {
	if (!client) {
		if (!process.env.MONGO_URI) {
			throw new Error('MONGO_URI is not set in the .env file');
		}
		client = new MongoClient(process.env.MONGO_URI, poolOptions);
	}
	return client;
}

async function getDatabase() {
	if (!dbInstance) {
		try {
			await getMongoClient().connect();
			console.log('Connected to MongoDB with connection pooling');
			dbInstance = getMongoClient().db('aedar_bot');
		}
		catch (error) {
			console.error('Error connecting to MongoDB:', error);
			throw error;
		}
	}
	return dbInstance;
}

export { getDatabase, getMongoClient };
