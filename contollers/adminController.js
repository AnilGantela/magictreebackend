const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.adminLogin = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  const correctPassword = "aX.19@y15"; // This is your constant admin password

  if (password !== correctPassword) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Create JWT token
  const token = jwt.sign(
    {
      role: "admin",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  res.json({
    message: "Admin login successful",
    token,
  });
};
