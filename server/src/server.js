
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");

// Server folder ki .env file load kar rahe hain
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});


console.log("Google Client ID loaded:", !!process.env.GOOGLE_CLIENT_ID);
console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);


// app.js se Express app aur uske sabhi routes import kar rahe hain
const app = require("./app");

// Database connect karke server start karenge
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server http://localhost:${PORT} par chal raha hai`);
    });
  } catch (error) {
    console.error("Server start nahi hua:", error.message);
  }
};

startServer();