const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],

    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    shippingAddress: { type: String, required: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" }, // Optional link to Payment
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
