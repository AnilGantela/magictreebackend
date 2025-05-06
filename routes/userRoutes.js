const express = require("express");
const router = express.Router();
const userController = require("../contollers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// Register & Login
router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);

// Protected Routes
router.get("/me", authMiddleware, userController.getUserById);
router.put("/me", authMiddleware, userController.updateUser);

// Address Management
router.post("/address", authMiddleware, userController.addAddress);
router.delete("/address/:index", authMiddleware, userController.removeAddress);
router.get("/addresses", authMiddleware, userController.getAllAddresses);
router.patch(
  "/address/:index/default",
  authMiddleware,
  userController.setDefaultAddress
);

module.exports = router;
