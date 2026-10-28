
const mongoose = require("mongoose");

// MongoDB database se connection banane ka function
const connectDB = async () => {
  try {
    // .env file se MongoDB ka address milta hai
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB successfully connect ho gaya!");
  } catch (error) {
    console.log("MongoDB connection mein error:", error.message);

    // Database connect nahi hua to program band kar denge
    process.exit(1);
  }
};

// Is function ko server.js mein use karne ke liye export kar rahe hain
module.exports = connectDB;
