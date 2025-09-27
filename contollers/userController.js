const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const OTP = require("../models/Otp");

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret";

// Register new user
const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, addresses } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      addresses,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, SECRET_KEY, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        addresses: newUser.addresses,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current user
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("orders")
      .populate("reviews")
      .populate("purchasedProducts");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update current user
const updateUser = async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add address
const addAddress = async (req, res) => {
  try {
    const { street, city, state, zip, country, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const newAddress = { street, city, state, zip, country, isDefault };

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(200).json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove address by index
const removeAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addressIndex = parseInt(req.params.index);

    if (!user || isNaN(addressIndex) || !user.addresses[addressIndex]) {
      return res.status(404).json({ message: "User or address not found" });
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    res.status(200).json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all addresses
const getAllAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Set default address
const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const index = parseInt(req.params.index);

    if (!user || isNaN(index) || !user.addresses[index]) {
      return res.status(404).json({ message: "User or address not found" });
    }

    user.addresses.forEach((addr, i) => {
      addr.isDefault = i === index;
    });

    await user.save();
    res.status(200).json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const requestDeleteUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in DB with 10 min expiry
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send OTP via email
    await sendEmail(
      email,
      "Confirm Account Deletion",
      `Your OTP is ${otp}. It is valid for 10 minutes.`,
      `<p>Your OTP is <b>${otp}</b>. It is valid for 10 minutes.</p>`
    );

    return res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("❌ requestDeleteUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 2️⃣ Step 2: Verify OTP and mark user for deletion
const verifyDeleteUser = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find OTP
    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ message: "Invalid OTP" });

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Mark user for deletion in 90 days
    const deletionDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    await User.updateOne({ email }, { deleteAt: deletionDate });

    // Cleanup OTP
    await Otp.deleteMany({ email });

    return res.json({
      message: "User marked for deletion in 90 days",
      deleteAt: deletionDate,
    });
  } catch (error) {
    console.error("❌ verifyDeleteUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createUser,
  loginUser,
  getUserById,
  updateUser,
  addAddress,
  removeAddress,
  setDefaultAddress,
  getAllAddresses,
  requestDeleteUser,
  verifyDeleteUser,
};
