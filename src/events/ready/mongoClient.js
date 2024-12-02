require('dotenv').config();
const { MongoClient } = require('mongodb');

// MongoDB URI and pooling options
const uri = process.env.MONGO_URI;
const poolOptions = {
  maxPoolSize: 15,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  waitQueueTimeoutMS: 5000,
};

const client = new MongoClient(uri, poolOptions);

// Ensure only one connection instance is created
let dbInstance;

async function getDatabase() {
  if (!dbInstance) {
	try {
	  await client.connect();
	  console.log('Connected to MongoDB with connection pooling');
	  dbInstance = client.db('aedar_bot');
	} catch (error) {
	  console.error('Error connecting to MongoDB:', error);
	  throw error;
	}
  }
  return dbInstance;
}

module.exports = { getDatabase, client };