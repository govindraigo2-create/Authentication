
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");

// Google Client ID se Google token verify karenge
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Common function: login ke baad apne app ka JWT aur user details bhejna
const sendLoginResponse = (res, user) => {
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

// Signup: naya user account banane ke liye
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email aur password zaroori hain",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password kam se kam 8 characters ka hona chahiye",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "Ye email pehle se registered hai",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);

    return res.status(500).json({
      message: "Server mein error aaya",
    });
  }
};

// Login: existing email/password user ko verify karne ke liye
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email aur password zaroori hain",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        message: "Email ya password galat hai",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Email ya password galat hai",
      });
    }

    return sendLoginResponse(res, user);
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Server mein error aaya",
    });
  }
};

// Google Sign-In: Google credential verify karke user login karna
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential required",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
      console.error("Google Client ID ya JWT_SECRET configured nahi hai");

      return res.status(500).json({
        message: "Authentication configuration incomplete hai",
      });
    }

    // Google se mila ID token verify karo
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Sirf verified Google email accept karo
    if (!payload || !payload.email || payload.email_verified !== true) {
      return res.status(401).json({
        message: "Google email verify nahi hua",
      });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || email.split("@")[0];

    // Email pehle se database mein hai to wahi account use karo
    let user = await User.findOne({ email });

    // Naya Google user hai to account create karo
    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
      });
    }

    return sendLoginResponse(res, user);
  } catch (error) {
    console.error("Google login error:", error.message);

    return res.status(401).json({
      message: "Google login failed. Please try again.",
    });
  }
};

// Teeno authentication functions export karo
module.exports = { signup, login, googleLogin };
