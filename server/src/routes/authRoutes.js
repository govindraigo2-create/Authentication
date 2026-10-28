
const express = require("express");
const router = express.Router();

// Controller se teeno functions import karo
const {
  signup,
  login,
  googleLogin,
} = require("../controllers/authController");

// Email/password signup
router.post("/signup", signup);

// Email/password login
router.post("/login", login);

// Google Sign-In
router.post("/google", googleLogin);

module.exports = router;
