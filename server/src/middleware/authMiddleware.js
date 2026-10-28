const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Request ke Authorization header se token lena
    const authHeader = req.headers.authorization;

    // Check karo ki Bearer token diya gaya hai
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. Please login first.",
      });
    }

    // Bearer ke baad wala token nikalna
    const token = authHeader.split(" ")[1];

    // JWT_SECRET se token verify karna
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Decoded user information request mein save karna
    req.user = decoded;

    // Agle controller par bhejna
    next();
  } catch (error) {
    console.error("Auth error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token. Please login again.",
    });
  }
};

module.exports = authMiddleware;
