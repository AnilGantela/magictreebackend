const express = require("express");
const router = express.Router();
const cartController = require("../contollers/cartController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware); // Apply auth to all routes

router.post("/add", cartController.addToCart);
router.get("/:userId", cartController.getCart); // Optional: update to use token
router.put("/update", cartController.updateCartItemQuantity);
router.delete("/remove", cartController.removeFromCart);
router.delete("/clear", cartController.clearCart);

module.exports = router;
