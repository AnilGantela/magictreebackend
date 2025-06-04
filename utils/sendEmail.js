const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    host: "mail.magictree.in",
    port: 587,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER, // info@magictree.in
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
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
