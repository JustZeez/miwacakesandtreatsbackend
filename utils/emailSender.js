const nodemailer = require('nodemailer');
const { getMiwaEmailTemplate, getCustomerEmailTemplate } = require('./emailTemplates');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOrderEmails = async (order) => {
  try {
    // Email to Miwa
    const miwaMailOptions = {
      from: `"Miwa Cakes Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to Miwa's email
      subject: `🎂 NEW ORDER: ${order.orderId} from ${order.customerName}`,
      html: getMiwaEmailTemplate(order)
    };

    // Email to Customer
    const customerMailOptions = {
      from: `"Miwa Cakes & Treats" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `✅ Order Confirmed: ${order.orderId}`,
      html: getCustomerEmailTemplate(order)
    };

    // Send both emails
    await transporter.sendMail(miwaMailOptions);
    console.log('📧 Email sent to Miwa');
    
    await transporter.sendMail(customerMailOptions);
    console.log('📧 Email sent to customer');

    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw new Error('Failed to send emails');
  }
};

module.exports = { sendOrderEmails };