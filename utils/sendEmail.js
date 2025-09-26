require("dotenv").config(); // <-- import dotenv and call config
const SibApiV3Sdk = require("@sendinblue/client");

// Initialize Brevo API client
const client = new SibApiV3Sdk.TransactionalEmailsApi();
client.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  XHaQNyYhCKTMDkxg
);

const sendEmail = async (to, subject, text, html) => {
  try {
    const sendSmtpEmail = {
      sender: {
        email: "magictreeindia@gmail.com",
        name: "Magic Tree Info Solutions",
      },
      to: [{ email: to }],
      subject: subject,
      textContent: text || "Please view this email in an HTML-enabled client",
      htmlContent: html || text,
    };

    const response = await client.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent successfully:", response);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error.response?.body || error);
    throw error;
  }
};

module.exports = sendEmail;
