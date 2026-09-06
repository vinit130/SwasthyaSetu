const mongoose = require('mongoose');
const seedInitialData = require('../utils/seedDataDirect');

// Disable query buffering so if MongoDB is not connected, queries fail immediately
// instead of hanging for 10,000ms buffer timeout
mongoose.set('bufferCommands', false);

let isConnecting = false;

const connectDB = async () => {
  if (isConnecting) return;
  isConnecting = true;

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('[MongoDB] ⚠️  MONGO_URI environment variable is not defined.');
    console.warn('[MongoDB] SwasthyaSetu is operating in In-Memory Demo Mode.');
    console.warn('[MongoDB] Demo accounts (asha@demo.com, doctor@demo.com, patient@demo.com / Demo@123) are ready.');
    isConnecting = false;
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);

    // Auto-seed demo records if DB is empty
    await seedInitialData();
    isConnecting = false;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.warn(`[MongoDB] Operating in In-Memory Demo Mode. Retrying connection in 15s...`);
    setTimeout(() => {
      isConnecting = false;
      connectDB();
    }, 15000);
  }
};

module.exports = connectDB;
