
require('dotenv').config();
const mongoose = require('mongoose');

async function connectToDatabase() {
    const dbURI = process.env.MONGODB_URI; 
    if (!dbURI) {
        console.error('Error: MONGODB_URI is not defined');
        process.exit(1); // Exit the process if the URI is not defined
    }

    try {
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Adjust the timeout value as needed
            socketTimeoutMS: 45000, // Adjust the timeout value as needed
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); 
    }

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
