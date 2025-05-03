const express = require("express");
const router = express.Router();
const {
  createReview,
  deleteReview,
  updateReview,
} = require("../contollers/reviewController");
const authMiddleware = require("../middlewares/authMiddleware");

// Create a review (user must be authenticated)
router.post("/create", authMiddleware, createReview);

// Update a review (user must be authenticated)
router.put("/:reviewId", authMiddleware, updateReview);

// Delete a review (user must be authenticated)
router.delete("/:reviewId", authMiddleware, deleteReview);

module.exports = router;
