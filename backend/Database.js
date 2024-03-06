require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.SERVER_MONGODB_URI;

const connectDB = async () => {
    try {
       await mongoose.connect(uri);
       console.log(" Success, connected to MongoDB") 
    } catch (error) {
        console.log("Mongodb error:", error.message);
    }
}
module.exports = connectDB;