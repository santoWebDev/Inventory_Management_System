const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("MongoDB Connected")
        console.log("Database:", mongoose.connection.db.databaseName);
    }
    catch(error){
        console.log("MongoDB Connection Failed:", error.message);
         throw error;
    }
}
module.exports = connectDB; 
