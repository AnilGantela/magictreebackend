const User = require("../models/User");
const OTP = require("../models/Otp");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  console.log("Sending OTP to:", email);
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  await OTP.create({ email, otp: otpCode });

  await sendEmail(email, "Your OTP Code", `Your OTP is ${otpCode}`);

  res.status(200).json({ message: "OTP sent to email" });
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const validOtp = await OTP.findOne({ email, otp });
  if (!validOtp)
    return res.status(400).json({ message: "Invalid or expired OTP" });

  res.status(200).json({ message: "OTP verified" });
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const validOtp = await OTP.findOne({ email, otp });
  if (!validOtp)
    return res.status(400).json({ message: "Invalid or expired OTP" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await OTP.deleteMany({ email }); // clear all OTPs after success

  res.status(200).json({ message: "Password reset successful" });
};
