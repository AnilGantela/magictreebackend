const User = require("../models/User");
const OTP = require("../models/Otp");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  console.log("Sending OTP to:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ email, otp: otpCode });

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
          <h2 style="color: #e34c26; margin: 0;">Your One-Time Password (OTP)</h2>
        </div>

        <p style="margin: 0 0 16px 0;">Hello,</p>
        <p style="margin: 0 0 16px 0;">Here is your one-time password for authentication:</p>

        <div style="background: #e34c26; background: linear-gradient(135deg, hsla(20, 100%, 22%, 1) 0%, hsla(19, 100%, 56%, 1) 100%); color: white; padding: 15px; border-radius: 6px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
          ${otpCode}
        </div>

        <p style="font-size: 14px; color: #666; margin: 20px 0 16px 0;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>

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

    await sendEmail(
      email,
      "Your OTP Code from Magic Tree Info Solutions",
      textContent,
      htmlContent
    );

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Error in sendOTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
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
