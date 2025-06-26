const express = require("express");
const router = express.Router();
const {
  adminLogin,
  getAllOrders,
  updateOrderStatus,
  getCodOrders,
  getOnlineOrders,
} = require("../contollers/adminController");
const verifyAdminToken = require("../middlewares/adminAuthentication");

// POST /admin/login
router.post("/login", adminLogin);
router.get("/orders", verifyAdminToken, getAllOrders);
router.get("/cod-orders", verifyAdminToken, getCodOrders);
router.get("/online-orders", verifyAdminToken, getOnlineOrders);
router.put("/update-order-status", verifyAdminToken, updateOrderStatus);

module.exports = router;
