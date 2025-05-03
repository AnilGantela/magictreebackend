const express = require("express");
const router = express.Router();
const userController = require("../contollers/userController"); // fixed typo
const authMiddleware = require("../middlewares/authMiddleware");

// Register new user
router.post("/register", userController.createUser); // was: registerUser

// Login user
router.post("/login", userController.loginUser);
router.post("/add-address", authMiddleware, userController.addAddress);
router.delete(
  "/remove-address/:index",
  authMiddleware,
  userController.removeAddress
);
router.get("/addresses", authMiddleware, userController.getAllAddresses);

// Get user by ID
router.get("/:id", userController.getUserById);

// Update user
router.put("/:id", userController.updateUser);

// Set default address by index
router.patch(
  "/:id/addresses/:index/default",
  authMiddleware,
  userController.setDefaultAddress
);

module.exports = router;
