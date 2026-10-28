
const mongoose = require("mongoose");

// User ke data ka structure define kar rahe hain
const userSchema = new mongoose.Schema(
  {
    // User ka naam
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Email unique hona chahiye
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Password ka hashed version save hoga
    password: {
      type: String,
      required: true,
    },
  },
  {
    // Account kab bana, uski date bhi save hogi
    timestamps: true,
  }
);

// Model export kar rahe hain taaki controller ise use kar sake
module.exports = mongoose.model("User", userSchema);
