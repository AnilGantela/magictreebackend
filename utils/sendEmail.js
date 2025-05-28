const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // or 'Mailgun', 'Outlook', etc.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"magic tree info solutions" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;
