const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Payment = require("../models/Payment");

const Razorpay = require("razorpay");
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      products,
      shippingAddress,
      shippingName,
      phoneNumber,
      paymentMethod, // "Cash on Delivery" or "Razorpay"
    } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Products list cannot be empty" });
    }
    if (!shippingName || !phoneNumber || !shippingAddress) {
      return res.status(400).json({
        message: "Shipping name, phone number, and address are required.",
      });
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      return res
        .status(400)
        .json({ message: "Phone number must be 10 digits." });
    }
    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required." });
    }

    let totalAmount = 0;
    for (const productItem of products) {
      const product = await Product.findById(productItem.product);
      if (!product) {
        return res.status(404).json({
          message: `Product with ID ${productItem.product} not found.`,
        });
      }
      const discountedPrice =
        product.price - (product.price * product.discount) / 100;
      totalAmount += discountedPrice * productItem.quantity;
    }

    // Create the order in your database
    const newOrder = new Order({
      user: userId,
      shippingName,
      phoneNumber,
      shippingAddress,
      products: products.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })),
      totalAmount,
      status: "Pending",
    });

    const savedOrder = await newOrder.save();

    let razorpayOrder = null;

    // If payment method is Razorpay, create a Razorpay order
    if (paymentMethod === "Online payment") {
      const options = {
        amount: totalAmount * 100, // Amount in paisa
        currency: "INR",
        receipt: `receipt_order_${savedOrder._id}`,
      };

      razorpayOrder = await razorpayInstance.orders.create(options);
    }

    // Create a payment record
    const payment = new Payment({
      user: userId,
      order: savedOrder._id,
      amount: totalAmount,
      method: paymentMethod,
      status: paymentMethod === "Cash on Delivery" ? "Pending" : "Initiated",
      transactionId: razorpayOrder ? razorpayOrder.id : null,
    });

    const savedPayment = await payment.save();

    // Link payment to order
    savedOrder.payment = savedPayment._id;
    await savedOrder.save();

    // Optional: add order ID to user
    await User.findByIdAndUpdate(userId, { $push: { orders: savedOrder._id } });

    // Prepare response
    const responsePayload = {
      message: "Order and Payment created successfully",
      order: savedOrder,
      payment: savedPayment,
    };

    // If Razorpay, send Razorpay keys & order id to frontend
    if (paymentMethod === "Online payment") {
      responsePayload.razorpayOrderId = razorpayOrder.id;
      responsePayload.razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      responsePayload.amount = razorpayOrder.amount;
      responsePayload.currency = razorpayOrder.currency;
    }

    res.status(201).json(responsePayload);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all orders for the user
    const orders = await Order.find({ user: userId })
      .populate("products.product") // Populate product details in the order
      .populate("payment"); // Optionally, populate payment details

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error.message);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;

    // Find the order by ID and make sure it's the logged-in user's order
    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("products.product") // Populate product details
      .populate("payment"); // Optionally, populate payment details

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order details:", error.message);
    res.status(500).json({ message: "Error fetching order details" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const userId = req.user._id;

    // Validate the new status
    const validStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    // Update the order status
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, user: userId },
      { status },
      { new: true } // Return the updated order
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message:
          "Order not found or you're not authorized to update this order",
      });
    }

    res
      .status(200)
      .json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error.message);
    res.status(500).json({ message: "Error updating order status" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;

    // Delete the order
    const deletedOrder = await Order.findOneAndDelete({
      _id: orderId,
      user: userId,
    });

    if (!deletedOrder) {
      return res.status(404).json({
        message:
          "Order not found or you're not authorized to delete this order",
      });
    }

    // Optionally, update the user's orders array to remove this order from the list
    await User.findByIdAndUpdate(userId, {
      $pull: { orders: orderId },
    });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error.message);
    res.status(500).json({ message: "Error deleting order" });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
