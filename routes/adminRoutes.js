const express = require("express");
const router = express.Router();
const { adminLogin } = require("../contollers/adminController");

// POST /admin/login
router.post("/login", adminLogin);

module.exports = router;
