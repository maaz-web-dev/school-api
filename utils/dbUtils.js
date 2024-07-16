const mongoose = require('mongoose');
require('dotenv').config();

async function connectToDatabase() {
    const dbURI = process.env.MONGODB_URI;
    try {
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }

    // Additional event logging
    mongoose.connection.on('connected', () => {
        console.log('Mongoose connected to ' + dbURI);
    });

    mongoose.connection.on('error', (err) => {
        console.error('Mongoose connection error: ' + err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose disconnected');
    });
}

// Optional: Handle process termination and MongoDB disconnection gracefully
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose disconnected on app termination');
    process.exit(0);
});

module.exports = { connectToDatabase };
