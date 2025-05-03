const jwt = require("jsonwebtoken");
const User = require("../models/User"); // ✅ Required
const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret";

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = await User.findById(decoded.userId); // ✅ Matches token structure
    if (!req.user) return res.status(401).json({ message: "User not found" });

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
