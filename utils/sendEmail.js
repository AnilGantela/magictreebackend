const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // use true if port = 465
    auth: {
      user: "97f379001@smtp-brevo.com", // your Brevo login
      pass: "XHaQNyYhCKTMDkxg", // actual password
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
