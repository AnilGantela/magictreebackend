const express = require("express");
const router = express.Router();
const userController = require("../contollers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const otpController = require("../contollers/otpController");

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

router.post("/send-otp", otpController.sendOTP);
router.post("/verify-otp", otpController.verifyOTP);
router.post("/reset-password", otpController.resetPassword);

router.post("/request-delete-user", userController.requestDeleteUser);
router.post("/verify-delete-user", userController.verifyDeleteUser);

module.exports = router;
