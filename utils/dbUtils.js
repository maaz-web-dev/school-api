const mongoose = require('mongoose');

async function connectToDatabase() {
    const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studentDB'; 
    try {
        await mongoose.connect(dbURI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); 
    }
}

module.exports = { connectToDatabase };
