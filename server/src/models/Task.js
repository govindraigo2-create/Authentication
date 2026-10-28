const mongoose = require("mongoose");

// Task ke liye database schema
const taskSchema = new mongoose.Schema(
  {
    // Task ka naam
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },

    // Task ki description
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Task complete hua ya nahi
    completed: {
      type: Boolean,
      default: false,
    },

    // Task kis user ka hai
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Task ki deadline (optional)
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Task model export
module.exports = mongoose.model("Task", taskSchema);
