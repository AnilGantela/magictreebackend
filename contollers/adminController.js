const bcrypt = require("bcryptjs");
const Order = require("../models/Order");
const sendEmail = require("../utils/sendEmail");
const Payment = require("../models/Payment");
const jwt = require("jsonwebtoken");
const { Parser } = require("json2csv");
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
  const { orderId, status, paymentStatus } = req.body;

  // Validate input
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
  const validPaymentStatuses = ["Initiated", "Pending", "Completed", "Failed"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
    return res.status(400).json({ message: "Invalid payment status" });
  }

  try {
    // Find order
    const order = await Order.findById(orderId).populate("user");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status
    order.status = status;
    await order.save();

    // If payment status provided and order has linked payment
    if (paymentStatus && order.payment) {
      const payment = await Payment.findById(order.payment);
      if (payment) {
        payment.status = paymentStatus;
        await payment.save();
      }
    }

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

// 1. Orders by Status
exports.getOrderStatusStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ message: "Error getting order status stats" });
  }
};

// 2. Revenue by Payment Method
exports.getRevenueByPaymentMethod = async (req, res) => {
  try {
    const data = await Payment.aggregate([
      {
        $group: {
          _id: "$method",
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: "Error getting revenue data" });
  }
};

// 3. Daily Revenue for Current Month
exports.getDailyRevenueCurrentMonth = async (req, res) => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const data = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDay, $lte: lastDay },
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          total: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { "_id.day": 1 },
      },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: "Error fetching daily revenue" });
  }
};

// 4. CSV Export
exports.exportOrdersCSV = async (req, res) => {
  try {
    const orders = await Order.find().populate("user").lean();

    const fields = [
      "_id",
      "status",
      "totalAmount",
      "createdAt",
      "shippingName",
      "shippingAddress",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(orders);

    res.header("Content-Type", "text/csv");
    res.attachment("orders.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "Failed to export orders" });
  }
};

// 5. Revenue in Custom Date Range
exports.getRevenueByRange = async (req, res) => {
  try {
    const { from, to } = req.body;
    const startDate = from
      ? new Date(from)
      : new Date(new Date().getFullYear(), 0, 1);
    const endDate = to ? new Date(to) : new Date();

    const data = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: "Error fetching range data" });
  }
};

exports.getMonthlyOrdersStats = async (req, res) => {
  try {
    // Use year from body or default to current year
    const year = req.body.year || new Date().getFullYear();

    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00Z`),
            $lte: new Date(`${year}-12-31T23:59:59Z`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    // Format result for charting
    const formatted = stats.map((entry) => {
      const date = new Date(year, entry._id.month - 1);
      return {
        month: date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        totalOrders: entry.totalOrders,
        totalRevenue: (entry.totalRevenue / 100).toFixed(2), // if stored in paise
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error("Error getting monthly stats:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
