const mongoose = require("mongoose");
const { categoryValues } = require("../categories");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String, required: true }], // Multiple image URLs
    category: {
      type: String,
      required: true,
      enum: categoryValues,
    },
    stock: { type: Number, required: true },
    discount: { type: Number, default: 0 },

    // Optional: track reviews directly on product (if needed)
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

    // Optional: average rating (to avoid calculating it each time)
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
