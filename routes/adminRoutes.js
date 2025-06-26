const express = require("express");
const router = express.Router();
const {
  adminLogin,
  getAllOrders,
  updateOrderStatus,
} = require("../contollers/adminController");
const verifyAdminToken = require("../middlewares/adminAuthentication");

// POST /admin/login
router.post("/login", adminLogin);
router.get("/orders", verifyAdminToken, getAllOrders);
router.put("/update-order-status", verifyAdminToken, updateOrderStatus);

module.exports = router;
