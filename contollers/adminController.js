const bcrypt = require("bcryptjs");
const Order = require("../models/Order");

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
      expiresIn: "4h",
    }
  );

  res.json({
    message: "Admin login successful",
    token,
  });
};

exports.getAllOrders = async (req, res) => {
  const orders = await Order.find();
  res.status(200).json({ message: "Orders fetched successfully", orders });
};

exports.updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res
      .status(400)
      .json({ message: "Order ID and status are required" });
  }

  const validStatuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res
      .status(200)
      .json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res
      .status(500)
      .json({ message: "Server error while updating order status" });
  }
};
