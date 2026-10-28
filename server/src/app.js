
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const taskRoutes = require("../src/routes/taskRoutes.js");
// Signup aur Login ke routes import kar rahe hain
const authRoutes = require("../src/routes/authRoutes");

// Express application create kar rahe hain
const app = express();

// Frontend ko backend API access karne ki permission
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Frontend se aane wale JSON data ko read karne ke liye
app.use(express.json());

// Cookies ko read karne ke liye
app.use(cookieParser());

// Signup aur Login ki APIs register kar rahe hain
app.use("/api/auth", authRoutes);

// Task APIs register karna
app.use("/api/tasks", taskRoutes);

// Server check karne ke liye simple route
app.get("/", (req, res) => {
  res.json({
    message: "Task Manager API is running",
  });
});

// App ko export kar rahe hain
module.exports = app;
