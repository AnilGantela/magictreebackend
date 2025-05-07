const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["Online payment", "Cash on Delivery"],
      required: true,
    },

    status: {
      type: String,
      enum: ["Initiated", "Pending", "Completed", "Failed"],
      default: "Pending",
    },

    transactionId: { type: String }, // Optional for reference
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
