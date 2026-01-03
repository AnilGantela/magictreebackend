require("dotenv").config();
const axios = require("axios");

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const sendEmail = async (to, subject, text, html) => {
  try {
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          email: "no-reply@magictree.in",
          name: "Magic Tree Info Solutions",
        },
        to: [{ email: to }],
        subject,
        textContent: text || "Please view this email in an HTML-enabled client",
        htmlContent: html || text,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );

    console.log("✅ Email sent successfully:", response.data.messageId);
    return true;
  } catch (error) {
    console.error(
      "❌ Error sending email:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = sendEmail;
