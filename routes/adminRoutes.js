const express = require("express");
const router = express.Router();
const verifyAdminToken = require("../middlewares/adminAuthentication");
const {
  adminLogin,
  getAllOrders,
  updateOrderStatus,
  getCodOrders,
  getOnlineOrders,
  getOrderStatusStats,
  getMonthlyOrdersStats,
  getRevenueByPaymentMethod,
  getDailyRevenueCurrentMonth,
  exportOrdersCSV,
  getRevenueByRange,
} = require("../contollers/adminController");

// Admin Auth
router.post("/login", adminLogin);

// Order Management
router.get("/orders", verifyAdminToken, getAllOrders);
router.put("/update-order-status", verifyAdminToken, updateOrderStatus);
router.get("/cod-orders", verifyAdminToken, getCodOrders);
router.get("/online-orders", verifyAdminToken, getOnlineOrders);

// 📊 Analytics Routes
router.get("/analytics/orders/status", verifyAdminToken, getOrderStatusStats);
router.post("/orders/monthly-stats", verifyAdminToken, getMonthlyOrdersStats);
router.get(
  "/analytics/revenue/payment-method",
  verifyAdminToken,
  getRevenueByPaymentMethod
);
router.get(
  "/analytics/revenue/daily",
  verifyAdminToken,
  getDailyRevenueCurrentMonth
);
router.get("/analytics/export/orders", verifyAdminToken, exportOrdersCSV);
router.post("/analytics/revenue/range", verifyAdminToken, getRevenueByRange);

module.exports = router;
