const express = require("express");
const router = express.Router();
const cartController = require("../contollers/cartController");

router.post("/add", cartController.addToCart);
router.get("/:userId", cartController.getCart);
router.put("/update", cartController.updateCartItemQuantity);
router.delete("/remove", cartController.removeFromCart);
router.delete("/clear", cartController.clearCart);

module.exports = router;
