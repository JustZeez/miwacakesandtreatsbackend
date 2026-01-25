const nodemailer = require("nodemailer");
const {
  getMiwaEmailTemplate,
  getCustomerEmailTemplate,
} = require("./emailTemplates");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, 
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 20000, 
  greetingTimeout: 15000,
  socketTimeout: 20000,
  tls: {
    rejectUnauthorized: false
  }
});

const sendOrderEmails = async (order) => {
  try {
    console.log("📧 Attempting to send emails...");

    const customerMailOptions = {
      from: `"Miwa Cakes & Treats" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `✅ Order Confirmed: ${order.orderId}`,
      html: getCustomerEmailTemplate(order),
    };

    const miwaMailOptions = {
      from: `"Miwa Cakes Website" <${process.env.EMAIL_USER}>`,
      to: process.env.MIWA_EMAIL || process.env.EMAIL_USER,
      subject: `🎂 NEW ORDER: ${order.orderId} from ${order.customerName}`,
      html: getMiwaEmailTemplate(order),
    };

    const customerResult = await transporter.sendMail(customerMailOptions);
    console.log("✅ Email sent to customer:", customerResult.response);

    const miwaResult = await transporter.sendMail(miwaMailOptions);
    console.log("✅ Email sent to Miwa:", miwaResult.response);

    return true;
  } catch (error) {
    console.error("❌ Email sending error details:", {
      message: error.message,
      code: error.code,
      command: error.command,
    });

    console.log("⚠️ Emails failed but order was saved to database");
    return false;
  }
};
// Test the connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Nodemailer Setup Error:", error.message);
  } else {
    console.log("🚀 Nodemailer is ready to send emails!");
  }
});

module.exports = { sendOrderEmails };
