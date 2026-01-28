
// const { getMiwaEmailTemplate, getCustomerEmailTemplate } = require("./emailTemplates");

// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendOrderEmails = async (order) => {
//   try {
//     console.log("📧 Attempting Resend API with fixed formatting...");

//     // This MUST be the email you used to sign up for Resend
//     const myVerifiedEmail = "agunbiademiwa@gmail.com"; 

//     // Test 1: Notification to you (as the owner)
//     const miwaResponse = await resend.emails.send({
//       from: 'onboarding@resend.dev', // Keep this EXACTLY like this
//       to: myVerifiedEmail,
//       subject: `🎂 NEW ORDER: ${order.orderId}`,
//       html: getMiwaEmailTemplate(order),
//     });

//     if (miwaResponse.error) {
//       console.error("❌ Resend Error (Miwa Email):", miwaResponse.error.message);
//     } else {
//       console.log("✅ Email 1 (Owner) sent to Resend Queue");
//     }

//     // Test 2: Confirmation (Sent to YOU also, to bypass the restriction)
//     const customerResponse = await resend.emails.send({
//       from: 'onboarding@resend.dev', 
//       to: myVerifiedEmail, 
//       subject: `✅ Order Confirmed: ${order.orderId}`,
//       html: getCustomerEmailTemplate(order),
//     });

//     if (customerResponse.error) {
//       console.error("❌ Resend Error (Customer Email):", customerResponse.error.message);
//     } else {
//       console.log("✅ Email 2 (Customer) sent to Resend Queue");
//     }

//     return true;
//   } catch (err) {
//     console.error("❌ System Error:", err.message);
//     return false;
//   }
// };

// module.exports = { sendOrderEmails };