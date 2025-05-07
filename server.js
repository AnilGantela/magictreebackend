const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const Payment = require("./models/Payment");
const Order = require("./models/Order");

require("express-async-errors");

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://magictree.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(morgan("dev"));
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

connectDB();

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.use("/admin", adminRoutes);
app.use("/products", productRoutes);
app.use("/user", userRoutes);
app.use("/review", reviewRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);

app.post("/payment/verify", async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpayOrderId + "|" + razorpayPaymentId)
    .digest("hex");

  if (generatedSignature === razorpaySignature) {
    try {
      // Find the payment by transactionId (you might have stored razorpayOrderId in transactionId)
      const payment = await Payment.findOne({ transactionId: razorpayOrderId });

      if (!payment) {
        return res
          .status(404)
          .json({ success: false, message: "Payment record not found" });
      }

      // Update payment status
      payment.status = "Completed";
      payment.transactionId = razorpayPaymentId; // store Razorpay payment ID
      await payment.save();

      // Update order status (linked by payment.order)
      const order = await Order.findById(payment.order);
      if (order) {
        order.status = "Processing"; // or "Paid", depending on your workflow
        await order.save();
      }

      return res.json({
        success: true,
        message: "Payment verified, order updated",
      });
    } catch (err) {
      console.error("Error verifying payment:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid signature" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
