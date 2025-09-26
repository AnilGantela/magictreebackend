require("dotenv").config();
const SibApiV3Sdk = require("@sendinblue/client");

// Use new API key (replace with your new key or use env variable)
const BREVO_API_KEY = process.env.BREVO_API_KEY || "YOUR_NEW_API_KEY_HERE";

// Initialize Brevo API client
const client = new SibApiV3Sdk.TransactionalEmailsApi();
client.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  BREVO_API_KEY
);

// Test function
const testBrevo = async () => {
  try {
    // 1️⃣ Check API key by fetching account info
    const accountApi = new SibApiV3Sdk.AccountApi();
    accountApi.setApiKey(SibApiV3Sdk.AccountApiApiKeys.apiKey, BREVO_API_KEY);
    const account = await accountApi.getAccount();
    console.log("✅ API Key is valid. Account info:", {
      email: account.email,
      plan: account.planName,
    });

    // 2️⃣ Send a test email
    const sendSmtpEmail = {
      sender: {
        email: process.env.SENDER_EMAIL || "magictreeindia@gmail.com", // must be verified in Brevo
        name: "Magic Tree Info Solutions",
      },
      to: [
        { email: process.env.TEST_RECEIVER_EMAIL || "your_email@gmail.com" },
      ], // your test email
      subject: "Brevo Test Email",
      textContent: "This is a test email sent via Brevo API.",
      htmlContent: "<b>This is a test email sent via Brevo API.</b>",
    };

    const response = await client.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Test email sent successfully:", response);
  } catch (error) {
    console.error("❌ Brevo test failed:", error.response?.body || error);
  }
};

// Run the test
testBrevo();
