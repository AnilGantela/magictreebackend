const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require("../contollers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

// Create an order (user must be authenticated)
router.post("/create", authMiddleware, createOrder);

// Get all orders for the authenticated user
router.get("/", authMiddleware, getUserOrders);

// Get details of a specific order by ID (user must be authenticated)
router.get("/:id", authMiddleware, getOrderById);

// Update order status (user must be authenticated)
router.put("/:id/status", authMiddleware, updateOrderStatus);

// Delete an order (user must be authenticated)
router.delete("/:id", authMiddleware, deleteOrder);

module.exports = router;
