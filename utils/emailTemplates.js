const getMiwaEmailTemplate = (order) => {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #d63384;">🎂 NEW ORDER RECEIVED!</h2>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
        <h3>📋 ORDER SUMMARY</h3>
        <p><strong>Order ID:</strong> <span style="background: yellow; padding: 2px 5px;">${order.orderId}</span></p>
        <p><strong>Customer:</strong> ${order.customerName}</p>
        <p><strong>Phone:</strong> ${order.phone}</p>
        <p><strong>WhatsApp:</strong> ${order.whatsapp || order.phone}</p>
        <p><strong>Total Amount:</strong> ₦${order.totalAmount.toLocaleString()}</p>
        <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>📍 DELIVERY ADDRESS</h3>
        <p>${order.address}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>🛒 ITEMS ORDERED</h3>
        <ul>
          ${order.cartItems.map(item => `
            <li>${item.name} × ${item.quantity} = ₦${item.total.toLocaleString()}</li>
          `).join('')}
        </ul>
      </div>
      
      <div style="background: #e7f7ff; padding: 15px; border-radius: 5px;">
        <h3>📱 IMPORTANT</h3>
        <p><strong>When customer contacts you:</strong></p>
        <p>Ask for their Order ID: <strong>${order.orderId}</strong></p>
        <p>This verifies they are the real customer.</p>
      </div>
      
      <div style="margin-top: 20px;">
        <h3>💰 PAYMENT PROOF</h3>
        <p><a href="${order.paymentProofUrl}">View Payment Screenshot</a></p>
      </div>
    </body>
    </html>
  `;
};

const getCustomerEmailTemplate = (order) => {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #28a745;">✅ ORDER CONFIRMED!</h2>
      
      <p>Dear ${order.customerName.split(' ')[0]},</p>
      
      <p>Thank you for your order at <strong>Miwa Cakes & Treats</strong>!</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>📋 YOUR ORDER DETAILS</h3>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Total:</strong> ₦${order.totalAmount.toLocaleString()}</p>
        <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
      </div>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 5px;">
        <h3>📱 WHAT'S NEXT?</h3>
        <p>1. Save your Order ID: <strong>${order.orderId}</strong></p>
        <p>2. WhatsApp Miwa with your Order ID for updates</p>
        <p>3. Miwa will verify your ID before discussing your order</p>
      </div>
      
      <p>Thank you for choosing Miwa Cakes & Treats! 🎂</p>
    </body>
    </html>
  `;
};

module.exports = { getMiwaEmailTemplate, getCustomerEmailTemplate };