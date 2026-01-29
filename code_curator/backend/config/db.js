/**
 * This file is used to connect to the MongoDB database
 */
const mongoose = require('mongoose');
const DB_NAME = 'codeyourway';

/**
 * Function to connect to the MongoDB database
 * @returns {Promise} a promise that resolves when the connection is established
 */
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI, {
            dbName: DB_NAME,
        });
        console.log(`\nMongo DB Connected ✅ : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MONGODB Connection Failed ❌ : ", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
