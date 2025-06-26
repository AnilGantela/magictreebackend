const bcrypt = require("bcryptjs");
const Order = require("../models/Order");
const sendEmail = require("../utils/sendEmail");
const Payment = require("../models/Payment");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// GET /orders/cod
exports.getCodOrders = async (req, res) => {
  try {
    const payments = await Payment.find({ method: "Cash on Delivery" }).select(
      "order"
    );
    const orderIds = payments.map((p) => p.order);

    const orders = await Order.find({ _id: { $in: orderIds } })
      .populate("user")
      .populate("products.product");

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("Error fetching COD orders:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch COD orders" });
  }
};

// GET /orders/online
exports.getOnlineOrders = async (req, res) => {
  try {
    const payments = await Payment.find({ method: "Online payment" }).select(
      "order"
    );
    const orderIds = payments.map((p) => p.order);

    const orders = await Order.find({ _id: { $in: orderIds } })
      .populate("user")
      .populate("products.product");

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("Error fetching online orders:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch online orders" });
  }
};

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
    const order = await Order.findById(orderId).populate("user");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    // Send delivery email if status is Delivered
    if (status === "Delivered" && order.user?.email) {
      const emailBody = `
        <h3>Your Order Has Been Delivered!</h3>
        <p>Dear ${order.shippingName || "Customer"},</p>
        <p>Your order <strong>#${
          order._id
        }</strong> has been successfully delivered.</p>
        <p>Thank you for shopping with <strong>Magic Tree</strong>.</p>
      `;

      await sendEmail(
        order.user.email,
        "Your Order Has Been Delivered!",
        "Your order has been delivered.",
        emailBody
      );
    }

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
