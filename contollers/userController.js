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
    const { email, reason } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in DB with 10 min expiry
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 3 * 60 * 1000),
    });

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your OTP Code</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 25px;">
              <img src="https://res.cloudinary.com/dfnjxybwp/image/upload/logo_zrouc4.jpg" alt="Magic Tree Info Solutions" style="max-width: 150px; margin-bottom: 15px;">
              <h2 style="color: #e34c26; margin: 0;">Your Account deletion confirmation.(OTP)</h2>
            </div>
    
            <p style="margin: 0 0 16px 0;">Hello,</p>
            <p style="margin: 0 0 16px 0;">Here is your one-time password for authentication:</p>
    
            <div style="background: #e34c26; background: linear-gradient(135deg, hsla(20, 100%, 22%, 1) 0%, hsla(19, 100%, 56%, 1) 100%); color: white; padding: 15px; border-radius: 6px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
              ${otpCode}
            </div>
    
            <p style="font-size: 14px; color: #666; margin: 20px 0 16px 0;">This OTP is valid for 3 minutes. Please do not share it with anyone.</p>
    
            <p style="margin: 0 0 16px 0;">If you didn't request this OTP, please ignore this email or contact support.</p>
    
            <div style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
              <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} MAGIC TREE INFO SOLUTIONS PVT. LTD. All rights reserved.</p>
              <p style="margin: 0;">#30-15-139, 1st Floor, Rams Arcade, Dabagardens, Visakhapatnam - 530020, AP, India</p>
            </div>
          </div>
        </body>
        </html>
        `;

    const textContent = `Your OTP Code: ${otpCode}\n\nThis OTP is valid for 10 minutes.\n\nMagic Tree Info Solutions`;
    const { name, phone } = user;

    const AdminSubject = `Account Deletion Request from ${email} Magic Tree Info Solutions`;

    const AdminText = `
${name} has requested account deletion.

User details:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}
- Reason for deletion: ${reason}

Please process accordingly.
`;

    const AdminContent = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #e34c26;">Account Deletion Request</h2>
  <p>A user has requested to delete their account. Details are as follows:</p>
  <ul>
    <li><strong>Name:</strong> ${name}</li>
    <li><strong>Email:</strong> ${email}</li>
    <li><strong>Phone:</strong> ${phone}</li>
    <li><strong>Reason:</strong> ${reason}</li>
  </ul>
  <p>Please process this request accordingly.</p>
</div>
`;

    await sendEmail({
      to: [
        { email: "anilkumar.gantela77@gmail.com" },
        { email: "akgak.1025@gmail.com" },
      ],
      AdminSubject,
      text: AdminText,
      html: AdminContent,
    });

    await sendEmail(
      email,
      "Your Account deletion Request from Magic Tree Info Solutions",
      textContent,
      htmlContent
    );
    // Send OTP via email

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
    const record = await OTP.findOne({ email, otp });
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
