// const nodemailer = require("nodemailer");
// const {
//   getMiwaEmailTemplate,
//   getCustomerEmailTemplate,
// } = require("./emailTemplates");

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true, // Must be true for port 465
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   // These settings are critical for hosted environments like Render
//   debug: true, // This will show detailed logs in Render console
//   logger: true, 
//   tls: {
//     rejectUnauthorized: false 
//   },
//   connectionTimeout: 20000, // 20 seconds
//   greetingTimeout: 15000,
//   socketTimeout: 30000,
// });
// const sendOrderEmails = async (order) => {
//   try {
//     console.log("📧 Attempting to send emails...");

//     const customerMailOptions = {
//       from: `"Miwa Cakes & Treats" <${process.env.EMAIL_USER}>`,
//       to: order.customerEmail,
//       subject: `✅ Order Confirmed: ${order.orderId}`,
//       html: getCustomerEmailTemplate(order),
//     };

//     const miwaMailOptions = {
//       from: `"Miwa Cakes Website" <${process.env.EMAIL_USER}>`,
//       to: process.env.MIWA_EMAIL || process.env.EMAIL_USER,
//       subject: `🎂 NEW ORDER: ${order.orderId} from ${order.customerName}`,
//       html: getMiwaEmailTemplate(order),
//     };

//     const customerResult = await transporter.sendMail(customerMailOptions);
//     console.log("✅ Email sent to customer:", customerResult.response);

//     const miwaResult = await transporter.sendMail(miwaMailOptions);
//     console.log("✅ Email sent to Miwa:", miwaResult.response);

//     return true;
//   } catch (error) {
//     console.error("❌ Email sending error details:", {
//       message: error.message,
//       code: error.code,
//       command: error.command,
//     });

//     console.log("⚠️ Emails failed but order was saved to database");
//     return false;
//   }
// };
// // Test the connection on startup
// transporter.verify((error, success) => {
//   if (error) {
//     console.error("❌ Nodemailer Setup Error:", error.message);
//   } else {
//     console.log("🚀 Nodemailer is ready to send emails!");
//   }
// });

// module.exports = { sendOrderEmails };
const Brevo = require('@getbrevo/brevo');
const {
  getMiwaEmailTemplate,
  getCustomerEmailTemplate,
} = require("./emailTemplates");

// Initialize Brevo API client
const apiInstance = new Brevo.TransactionalEmailsApi();

// Set the API Key from your .env
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey, 
  process.env.BREVO_API_KEY
);

const sendOrderEmails = async (order) => {
  try {
    console.log("📧 Attempting to send emails via Brevo API...");

    // 1. Email to Customer
    const customerEmail = new Brevo.SendSmtpEmail();
    customerEmail.subject = `✅ Order Confirmed: ${order.orderId}`;
    customerEmail.htmlContent = getCustomerEmailTemplate(order);
    customerEmail.sender = { 
      name: "Miwa Cakes & Treats", 
      email: process.env.EMAIL_USER 
    };
    customerEmail.to = [{ 
      email: order.customerEmail, 
      name: order.customerName 
    }];

    await apiInstance.sendTransacEmail(customerEmail);
    console.log("✅ API: Email sent to customer");

    // 2. Email to Miwa (Store Owner)
    const miwaEmail = new Brevo.SendSmtpEmail();
    miwaEmail.subject = `🎂 NEW ORDER: ${order.orderId} from ${order.customerName}`;
    miwaEmail.htmlContent = getMiwaEmailTemplate(order);
    miwaEmail.sender = { 
      name: "Website Notifier", 
      email: process.env.EMAIL_USER 
    };
    miwaEmail.to = [{ 
      email: process.env.MIWA_EMAIL || process.env.EMAIL_USER 
    }];

    await apiInstance.sendTransacEmail(miwaEmail);
    console.log("✅ API: Email sent to Miwa");

    return true;
  } catch (error) {
    // Brevo provides detailed error messages in error.response.body
    const errorDetails = error.response ? error.response.body : error.message;
    console.error("❌ Brevo API Error:", errorDetails);
    
    console.log("⚠️ Emails failed but order was saved to database");
    return false;
  }
};

console.log("🚀 Brevo Email Service Initialized");

module.exports = { sendOrderEmails };