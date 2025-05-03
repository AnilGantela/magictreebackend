const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zip: String,
  country: String,
  isDefault: { type: Boolean, default: false }, // Optional: mark default address
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },

    // Multiple structured addresses
    addresses: [addressSchema],

    // References to Review model
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

    // References to Order model
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],

    // References to purchased Product IDs
    purchasedProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
