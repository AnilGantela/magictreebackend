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

  const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .container {
          background-color: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 25px;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 15px;
        }
        .otp-container {
          background: linear-gradient(135deg, hsla(20, 100%, 22%, 1) 0%, hsla(19, 100%, 56%, 1) 100%);
          color: white;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 3px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #777;
          text-align: center;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: linear-gradient(135deg, hsla(20, 100%, 22%, 1) 0%, hsla(19, 100%, 56%, 1) 100%);
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin-top: 15px;
        }
        .note {
          font-size: 14px;
          color: #666;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://asset.cloudinary.com/dfnjxybwp/b9dad8811046f801c0ff7889c39a3b9e" alt="Company Logo" class="logo">
          <h2>Your One-Time Password (OTP)</h2>
        </div>
        
        <p>Hello,</p>
        <p>Here is your one-time password for authentication:</p>
        
        <div class="otp-container">
          ${otpCode}
        </div>
        
        <p class="note">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
        
        <p>If you didn't request this OTP, please ignore this email or contact support.</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} MAGIC TREE INFO SOLUTIONS PVT. LTD . All rights reserved.</p>
          <p>#30-15-139, 1st Floor, Rams Arcade, Dabagardens, Visakhapatnam - 530020, AP, India</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, "Your OTP Code", emailTemplate);

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
