const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    host: "mail.magictree.in",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // actual password
    },
  });

  const mailOptions = {
    from: `"Magic Tree Info Solutions" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: text || "Please view this email in an HTML-enabled client",
    html: html || text,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
