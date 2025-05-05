const mongoose = require("mongoose");
const { categoryValues, subcategoryValues } = require("../categories");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String, required: true }],
    category: {
      type: String,
      required: true,
      enum: categoryValues,
    },
    subcategory: {
      type: String,
      enum: subcategoryValues,
    },
    stock: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
