const Review = require("../models/Review");
const Product = require("../models/Product");

// Add a review
const createReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user._id;

  try {
    // Check if user already reviewed the product
    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product." });
    }

    // Save new review
    const newReview = new Review({
      user: userId,
      product: productId,
      rating,
      comment,
    });

    const savedReview = await newReview.save();

    // 🔁 Recalculate average rating
    const allReviews = await Review.find({ product: productId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    // ⬆️ Update the product
    await Product.findByIdAndUpdate(productId, {
      averageRating: avgRating.toFixed(1), // or just avgRating
    });

    res.status(201).json(savedReview);
  } catch (err) {
    console.error("Create Review Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all reviews by a user
const getReviewsByUser = async (req, res) => {
  const userId = req.user._id;

  try {
    const reviews = await Review.find({ user: userId })
      .populate("product", "name images")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    console.error("Fetch User Reviews Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (!review.user.equals(userId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this review" });
    }

    await review.deleteOne();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Delete Review Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Optional: Update review
const updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  try {
    const review = await Review.findById(reviewId);

    if (!review) return res.status(404).json({ message: "Review not found" });

    if (!review.user.equals(userId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this review" });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    const updated = await review.save();
    res.status(200).json(updated);
  } catch (err) {
    console.error("Update Review Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createReview,
  getReviewsByUser,
  deleteReview,
  updateReview,
};
