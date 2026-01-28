// const getMiwaEmailTemplate = (order) => {
//   const itemsWithTotals = order.cartItems.map((item) => ({
//     name: item.name || "Unknown Item",
//     quantity: item.quantity || 1,
//     price: item.price || 0,
//     netPrice: (item.price || 0) * (item.quantity || 1),
//   }));

//   const subtotal = itemsWithTotals.reduce(
//     (sum, item) => sum + item.netPrice,
//     0
//   );

//   const vat = subtotal > 10000 ? 50 : 0;
//   const orderTotal = subtotal + vat;

//   const formatCurrency = (amount) => {
//     return `₦${amount.toLocaleString()}`;
//   };

//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>🎂 New Order: ${order.orderId}</title>
//       <style>
//         body { 
//           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//           line-height: 1.6; 
//           color: #333; 
//           max-width: 700px; 
//           margin: 0 auto; 
//           background: #f9f9f9;
//         }
//         .container { 
//           background: white; 
//           border-radius: 15px; 
//           overflow: hidden; 
//           box-shadow: 0 5px 25px rgba(0,0,0,0.1); 
//           margin: 20px; 
//           border: 1px solid #eaeaea;
//         }
//         .header { 
//           background: linear-gradient(135deg, #d63384, #ff6b9d); 
//           color: white; 
//           padding: 30px 20px; 
//           text-align: center;
//         }
//         .header h1 { 
//           margin: 0; 
//           font-size: 28px; 
//           display: flex; 
//           align-items: center; 
//           justify-content: center; 
//           gap: 15px;
//         }
//         .order-id { 
//           background: rgba(255,255,255,0.2); 
//           padding: 8px 15px; 
//           border-radius: 20px; 
//           font-weight: bold; 
//           letter-spacing: 1px;
//           font-family: monospace;
//           font-size: 18px;
//         }
//         .section { 
//           padding: 25px; 
//           border-bottom: 1px solid #eee; 
//         }
//         .section:last-child { border-bottom: none; }
//         .section-title { 
//           color: #d63384; 
//           margin-top: 0; 
//           display: flex; 
//           align-items: center; 
//           gap: 10px;
//           font-size: 20px;
//         }
//         .highlight-box { 
//           background: linear-gradient(to right, #fff5f7, #fff0f5); 
//           border-left: 4px solid #d63384; 
//           padding: 20px; 
//           border-radius: 0 8px 8px 0;
//           margin: 20px 0;
//         }
//         .info-grid { 
//           display: grid; 
//           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
//           gap: 15px; 
//           margin-top: 15px;
//         }
//         .info-item { 
//           background: #f8f9fa; 
//           padding: 15px; 
//           border-radius: 8px; 
//           border: 1px solid #eaeaea;
//         }
//         .info-label { 
//           color: #666; 
//           font-size: 14px; 
//           margin-bottom: 5px; 
//           display: block;
//         }
//         .info-value { 
//           font-weight: 600; 
//           color: #333; 
//           font-size: 16px;
//         }
//         .order-table { 
//           width: 100%; 
//           border-collapse: collapse; 
//           margin-top: 15px;
//           background: white;
//           border-radius: 8px;
//           overflow: hidden;
//           box-shadow: 0 2px 10px rgba(0,0,0,0.05);
//         }
//         .order-table th { 
//           background: #f8f9fa; 
//           padding: 15px; 
//           text-align: left; 
//           font-weight: 600; 
//           color: #555;
//           border-bottom: 2px solid #eaeaea;
//         }
//         .order-table td { 
//           padding: 15px; 
//           border-bottom: 1px solid #eee; 
//         }
//         .order-table tr:last-child td { border-bottom: none; }
//         .order-table tr:hover { background: #f9f9f9; }
//         .total-row { 
//           background: #fff5f7 !important; 
//           font-weight: bold; 
//           color: #d63384;
//           font-size: 18px;
//         }
//         .total-row td { padding: 20px 15px; }
//         .payment-proof { 
//           display: inline-block; 
//           background: #d63384; 
//           color: white; 
//           padding: 12px 25px; 
//           text-decoration: none; 
//           border-radius: 8px; 
//           font-weight: 600;
//           margin-top: 10px;
//           transition: background 0.3s;
//         }
//         .payment-proof:hover { 
//           background: #c22569; 
//           transform: translateY(-2px);
//           box-shadow: 0 4px 12px rgba(210, 51, 132, 0.3);
//         }
//         .whatsapp-note { 
//           background: #25D366; 
//           color: white; 
//           padding: 15px; 
//           border-radius: 8px; 
//           text-align: center;
//           margin-top: 20px;
//           font-weight: 600;
//         }
//         .icon { 
//           font-size: 22px; 
//           vertical-align: middle; 
//           margin-right: 8px;
//         }
//         @media (max-width: 600px) {
//           .info-grid { grid-template-columns: 1fr; }
//           .order-table { font-size: 14px; }
//           .order-table th, .order-table td { padding: 10px; }
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <!-- Header -->
//         <div class="header">
//           <h1>
//             <span class="icon">🎂</span>
//             NEW ORDER RECEIVED!
//           </h1>
//           <p style="margin-top: 10px; opacity: 0.9;">Order ID: <span class="order-id">${
//             order.orderId
//           }</span></p>
//         </div>

//         <!-- Order Summary -->
//         <div class="section">
//           <h2 class="section-title">
//             <span class="icon">📋</span>
//             ORDER SUMMARY
//           </h2>
//           <div class="info-grid">
//             <div class="info-item">
//               <span class="info-label">Customer Name</span>
//               <span class="info-value">${order.customerName}</span>
//             </div>
//             <div class="info-item">
//               <span class="info-label">Phone Number</span>
//               <span class="info-value">${order.phone}</span>
//             </div>
//             <div class="info-item">
//               <span class="info-label">WhatsApp</span>
//               <span class="info-value">${order.whatsapp || order.phone}</span>
//             </div>
//             <div class="info-item">
//               <span class="info-label">Total Amount</span>
//               <span class="info-value" style="color: #d63384; font-size: 18px;">${formatCurrency(
//                 orderTotal
//               )}</span>
//             </div>
//           </div>
//           <div style="margin-top: 20px; background: #f0f8ff; padding: 15px; border-radius: 8px;">
//             <span class="info-label">Order Date & Time</span>
//             <span class="info-value">${new Date(order.orderDate).toLocaleString(
//               "en-US",
//               {
//                 weekday: "long",
//                 year: "numeric",
//                 month: "long",
//                 day: "numeric",
//                 hour: "2-digit",
//                 minute: "2-digit",
//               }
//             )}</span>
//           </div>
//         </div>

//         <!-- Delivery Address -->
//         <div class="section">
//           <h2 class="section-title">
//             <span class="icon">📍</span>
//             DELIVERY ADDRESS
//           </h2>
//           <div class="highlight-box">
//             <p style="margin: 0; font-size: 16px; line-height: 1.8;">${
//               order.address
//             }</p>
//           </div>
//         </div>

//         <!-- Items Ordered (TABLE) -->
//         <div class="section">
//           <h2 class="section-title">
//             <span class="icon">🛒</span>
//             ITEMS ORDERED
//           </h2>
//           <table class="order-table">
//             <thead>
//               <tr>
//                 <th style="width: 40%;">ITEM NAME</th>
//                 <th style="width: 15%; text-align: center;">QUANTITY</th>
//                 <th style="width: 20%; text-align: right;">PRICE</th>
//                 <th style="width: 25%; text-align: right;">NET PRICE</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${itemsWithTotals
//                 .map(
//                   (item) => `
//                 <tr>
//                   <td style="font-weight: 500;">${item.name}</td>
//                   <td style="text-align: center;">${item.quantity}</td>
//                   <td style="text-align: right;">${formatCurrency(
//                     item.price
//                   )}</td>
//                   <td style="text-align: right;">${formatCurrency(
//                     item.netPrice
//                   )}</td>
//                 </tr>
//               `
//                 )
//                 .join("")}
//               <!-- Subtotal Row -->
//               <tr>
//                 <td colspan="3" style="text-align: right; padding-right: 20px; font-weight: 600;">Subtotal:</td>
//                 <td style="text-align: right; font-weight: 600;">${formatCurrency(
//                   subtotal
//                 )}</td>
//               </tr>

//                <!-- VAT Row (only if applicable) -->

//                ${
//                  vat > 0
//                    ? `
//                 <tr>
//                   <td colspan="3" style="text-align: right; padding-right: 20px;">VAT Fee:</td>
//                   <td style="text-align: right;">${formatCurrency(vat)}</td>
//                 </tr>
//               `
//                    : ""
//                }
//               <!-- Total Row -->
//               <tr class="total-row">
//                 <td colspan="3" style="text-align: right; padding-right: 20px;">TOTAL AMOUNT:</td>
//                 <td style="text-align: right; font-size: 20px;">${formatCurrency(
//                   orderTotal
//                 )}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         <!-- Important Note -->
//         <div class="section">
//           <h2 class="section-title">
//             <span class="icon">📱</span>
//             IMPORTANT NOTE
//           </h2>
//           <div class="whatsapp-note">
//             ⚠️ WHEN CUSTOMER CONTACTS YOU ON WHATSAPP:<br>
//             Always ask for their Order ID: <strong style="background: white; color: #25D366; padding: 3px 10px; border-radius: 4px;">${
//               order.orderId
//             }</strong>
//           </div>
//           <p style="margin-top: 15px; text-align: center; color: #666;">
//             This ensures you're speaking to the real customer and prevents scams.
//           </p>
//         </div>

//         <!-- Payment Proof -->
//         <div class="section" style="text-align: center;">
//           <h2 class="section-title">
//             <span class="icon">💰</span>
//             PAYMENT PROOF
//           </h2>
//           <p style="margin-bottom: 20px;">Customer has uploaded payment evidence. Click below to view:</p>
//           <a href="${
//             order.paymentProofUrl
//           }" target="_blank" class="payment-proof">
//             🔗 VIEW PAYMENT SCREENSHOT
//           </a>
//           <p style="margin-top: 15px; color: #666; font-size: 14px;">
//             Link expires: ${new Date(
//               Date.now() + 30 * 24 * 60 * 60 * 1000
//             ).toLocaleDateString()}
//           </p>
//         </div>

//         <!-- Footer -->
//         <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #888; font-size: 14px; border-top: 1px solid #eee;">
//           <p style="margin: 0;">
//             🎂 <strong>Miwa Cakes & Treats</strong> | Automated Order System<br>
//             <span style="font-size: 12px;">Order ID: ${
//               order.orderId
//             } • Generated: ${new Date().toLocaleTimeString()}</span>
//           </p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// };

// const getCustomerEmailTemplate = (order) => {
//   const itemsWithTotals = order.cartItems.map((item) => ({
//     name: item.name || "Item",
//     quantity: item.quantity || 1,
//     price: item.price || 0,
//     netPrice: (item.price || 0) * (item.quantity || 1),
//   }));

//   const subtotal = itemsWithTotals.reduce(
//     (sum, item) => sum + item.netPrice,
//     0
//   );

//   const vat = subtotal > 10000 ? 50 : 0;
//   const orderTotal = subtotal + vat;

//   const formatCurrency = (amount) => {
//     return `₦${amount.toLocaleString()}`;
//   };

//   const firstName = order.customerName.split(" ")[0];

//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>✅ Order Confirmed: ${order.orderId}</title>
//       <style>
//         body { 
//           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//           line-height: 1.6; 
//           color: #333; 
//           max-width: 700px; 
//           margin: 0 auto; 
//           background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
//           padding: 20px;
//         }
//         .container { 
//           background: white; 
//           border-radius: 15px; 
//           overflow: hidden; 
//           box-shadow: 0 10px 40px rgba(0,0,0,0.1); 
//           border: 1px solid #eaeaea;
//         }
//         .header { 
//           background: linear-gradient(135deg, #28a745, #20c997); 
//           color: white; 
//           padding: 40px 20px; 
//           text-align: center;
//           position: relative;
//           overflow: hidden;
//         }
//         .header::before {
//           content: "🎂";
//           font-size: 80px;
//           position: absolute;
//           opacity: 0.1;
//           right: 20px;
//           top: 10px;
//         }
//         .header h1 { 
//           margin: 0; 
//           font-size: 32px; 
//           display: flex; 
//           align-items: center; 
//           justify-content: center; 
//           gap: 15px;
//           position: relative;
//         }
//         .order-id { 
//           background: rgba(255,255,255,0.2); 
//           padding: 10px 20px; 
//           border-radius: 25px; 
//           font-weight: bold; 
//           letter-spacing: 1px;
//           font-family: 'Courier New', monospace;
//           font-size: 20px;
//           display: inline-block;
//           margin-top: 15px;
//           border: 2px dashed rgba(255,255,255,0.3);
//         }
//         .section { 
//           padding: 30px; 
//           border-bottom: 1px solid #eee; 
//         }
//         .section:last-child { border-bottom: none; }
//         .section-title { 
//           color: #20c997; 
//           margin-top: 0; 
//           display: flex; 
//           align-items: center; 
//           gap: 10px;
//           font-size: 22px;
//           border-bottom: 2px solid #f0f0f0;
//           padding-bottom: 10px;
//         }
//         .greeting {
//           font-size: 18px;
//           color: #555;
//           margin-bottom: 25px;
//         }
//         .order-table { 
//           width: 100%; 
//           border-collapse: collapse; 
//           margin: 25px 0;
//           background: white;
//           border-radius: 10px;
//           overflow: hidden;
//           box-shadow: 0 3px 15px rgba(0,0,0,0.05);
//         }
//         .order-table th { 
//           background: #f8f9fa; 
//           padding: 18px; 
//           text-align: left; 
//           font-weight: 600; 
//           color: #555;
//           border-bottom: 2px solid #eaeaea;
//           font-size: 16px;
//         }
//         .order-table td { 
//           padding: 18px; 
//           border-bottom: 1px solid #eee; 
//           font-size: 16px;
//         }
//         .order-table tr:last-child td { border-bottom: none; }
//         .order-table tr:hover { background: #f9f9f9; }
//         .total-row { 
//           background: linear-gradient(to right, #e8f5e9, #c8e6c9) !important; 
//           font-weight: bold; 
//           color: #2e7d32;
//           font-size: 18px;
//         }
//         .total-row td { 
//           padding: 22px 18px; 
//           font-size: 20px;
//         }
//         .whatsapp-box { 
//           background: linear-gradient(135deg, #25D366, #128C7E); 
//           color: white; 
//           padding: 25px; 
//           border-radius: 12px; 
//           text-align: center;
//           margin: 30px 0;
//           box-shadow: 0 5px 20px rgba(37, 211, 102, 0.3);
//         }
//         .whatsapp-id {
//           background: white; 
//           color: #25D366; 
//           padding: 12px 25px; 
//           border-radius: 25px; 
//           font-size: 22px;
//           font-weight: bold;
//           font-family: 'Courier New', monospace;
//           display: inline-block;
//           margin: 15px 0;
//           border: 2px solid #25D366;
//         }
//         .action-buttons {
//           display: flex;
//           gap: 15px;
//           justify-content: center;
//           margin-top: 20px;
//           flex-wrap: wrap;
//         }
//         .btn { 
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           gap: 10px;
//           background: #25D366; 
//           color: white; 
//           padding: 16px 30px; 
//           text-decoration: none; 
//           border-radius: 10px; 
//           font-weight: 600;
//           font-size: 16px;
//           transition: all 0.3s;
//           border: none;
//           cursor: pointer;
//           min-width: 200px;
//         }
//         .btn:hover { 
//           transform: translateY(-3px);
//           box-shadow: 0 7px 20px rgba(37, 211, 102, 0.4);
//         }
//         .btn-secondary {
//           background: #6c757d;
//         }
//         .btn-secondary:hover {
//           background: #5a6268;
//           box-shadow: 0 7px 20px rgba(108, 117, 125, 0.3);
//         }
//         .security-note { 
//           background: #fff3cd; 
//           border-left: 4px solid #ffc107; 
//           padding: 20px; 
//           border-radius: 0 8px 8px 0;
//           margin: 25px 0;
//           color: #856404;
//         }
//         .icon { 
//           font-size: 24px; 
//           vertical-align: middle; 
//         }
//         .footer { 
//           background: #f8f9fa; 
//           padding: 25px; 
//           text-align: center; 
//           color: #666; 
//           border-top: 1px solid #eee;
//         }
//         @media (max-width: 600px) {
//           .order-table { font-size: 14px; }
//           .order-table th, .order-table td { padding: 12px; }
//           .header h1 { font-size: 24px; }
//           .order-id { font-size: 16px; }
//           .action-buttons { flex-direction: column; }
//           .btn { width: 100%; }
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <!-- Header -->
//         <div class="header">
//           <h1>
//             <span class="icon">✅</span>
//             ORDER CONFIRMED!
//           </h1>
//           <p style="margin-top: 5px; opacity: 0.9; font-size: 18px;">Your delicious treats are being prepared</p>
//           <div class="order-id">${order.orderId}</div>
//         </div>

//         <!-- Greeting -->
//         <div class="section">
//           <div class="greeting">
//             <p>Dear <strong style="color: #20c997;">${firstName}</strong>,</p>
//             <p>Thank you for ordering from <strong style="color: #d63384;">Miwa Cakes & Treats</strong>! 🎂<br>
//             Your order has been received and is now being processed.</p>
//           </div>

//           <!-- Order Summary -->
//           <h2 class="section-title">
//             <span class="icon">📋</span>
//             ORDER SUMMARY
//           </h2>
          
//           <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
//             <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
//               <div>
//                 <div style="color: #666; font-size: 14px; margin-bottom: 5px;">Order ID</div>
//                 <div style="font-weight: 600; font-size: 18px;">${
//                   order.orderId
//                 }</div>
//               </div>
//               <div>
//                 <div style="color: #666; font-size: 14px; margin-bottom: 5px;">Total Amount</div>
//                 <div style="font-weight: 600; color: #d63384; font-size: 22px;">${formatCurrency(
//                   orderTotal
//                 )}</div>
//               </div>
//               <div>
//                 <div style="color: #666; font-size: 14px; margin-bottom: 5px;">Order Date</div>
//                 <div style="font-weight: 600;">${new Date(
//                   order.orderDate
//                 ).toLocaleDateString("en-US", {
//                   weekday: "long",
//                   year: "numeric",
//                   month: "long",
//                   day: "numeric",
//                 })}</div>
//               </div>
//             </div>
//           </div>

//           <!-- Delivery Address -->
//           <h2 class="section-title">
//             <span class="icon">📍</span>
//             DELIVERY ADDRESS
//           </h2>
//           <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2196f3;">
//             <p style="margin: 0; font-size: 16px; line-height: 1.8;">${
//               order.address
//             }</p>
//           </div>
//         </div>

//         <!-- Items Ordered TABLE -->
//         <div class="section">
//           <h2 class="section-title">
//             <span class="icon">🛒</span>
//             YOUR ORDER ITEMS
//           </h2>
          
//           <table class="order-table">
//             <thead>
//               <tr>
//                 <th style="width: 40%;">ITEM NAME</th>
//                 <th style="width: 15%; text-align: center;">QUANTITY</th>
//                 <th style="width: 20%; text-align: right;">PRICE</th>
//                 <th style="width: 25%; text-align: right;">NET PRICE</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${itemsWithTotals
//                 .map(
//                   (item) => `
//                 <tr>
//                   <td style="font-weight: 500; color: #333;">${item.name}</td>
//                   <td style="text-align: center; color: #666;">${
//                     item.quantity
//                   }</td>
//                   <td style="text-align: right; color: #333; font-weight: 500;">${formatCurrency(
//                     item.price
//                   )}</td>
//                   <td style="text-align: right; color: #333; font-weight: 500;">${formatCurrency(
//                     item.netPrice
//                   )}</td>
//                 </tr>
//               `
//                 )
//                 .join("")}

//                       <!-- Subtotal Row -->
//               <tr>
//                 <td colspan="3" style="text-align: right; padding-right: 20px; font-weight: 600;">Subtotal:</td>
//                 <td style="text-align: right; font-weight: 600;">${formatCurrency(
//                   subtotal
//                 )}</td>
//               </tr>
              
//               <!-- VAT Row (only if applicable) -->
//               ${
//                 vat > 0
//                   ? `
//                 <tr>
//                   <td colspan="3" style="text-align: right; padding-right: 20px;">VAT Fee:</td>
//                   <td style="text-align: right;">${formatCurrency(vat)}</td>
//                 </tr>
//               `
//                   : ""
//               }
              
//               <!-- Total Row -->
//               <tr class="total-row">
//                 <td colspan="2" style="text-align: right; padding-right: 20px;">TOTAL AMOUNT:</td>
//                 <td style="text-align: right;">${formatCurrency(
//                   orderTotal
//                 )}</td>
//               </tr>
//             </tbody>
//           </table>
//           <!-- VAT Notice (only for customer, only if applicable) -->
//           ${
//             vat > 0
//               ? `
//             <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-left: 4px solid #6c757d; border-radius: 0 8px 8px 0;">
//               <p style="margin: 0; color: #666; font-size: 14px;">
//                 <strong>Note:</strong> A ₦50 VAT fee is applied to orders greater than ₦10,000 as per regulations.
//               </p>
//             </div>
//           `
//               : ""
//           }
//         </div>

//         </div>

//                 <!-- WhatsApp Instructions -->
//         <div class="section">
//           <div class="whatsapp-box">
//             <span class="icon" style="font-size: 40px;">📱</span>
//             <h3 style="margin: 15px 0; color: white; font-size: 24px;">FOR ORDER UPDATES</h3>
//             <p style="margin: 10px 0; opacity: 0.9;">WhatsApp Miwa at:</p>
//             <div style="background: white; color: #25D366; padding: 12px 25px; border-radius: 25px; font-size: 22px; font-weight: bold; font-family: 'Arial', sans-serif; display: inline-block; margin: 10px 0; border: 2px solid #25D366;">
//               +234 815 668 6247
//             </div>
//             <p style="margin: 15px 0; opacity: 0.9;">Include your Order ID:</p>
//             <div class="whatsapp-id">${order.orderId}</div>
//             <p style="margin: 15px 0; font-size: 14px; opacity: 0.9;">
//               Miwa will use this ID to verify your order and provide updates
//             </p>
//           </div>

//           <div class="security-note">
//             <span class="icon">🔒</span>
//             <strong>SECURITY REMINDER:</strong> Miwa will always ask for your Order ID before discussing your order. 
//             This protects you from scams and ensures your order details remain private.
//           </div>

//           <!-- Action Buttons -->
//           <div class="action-buttons">
//             <a href="https://wa.me/2348156686247?text=Hi%20Miwa,%20my%20Order%20ID%20is%20${
//               order.orderId
//             }%20%F0%9F%8E%82" 
//                class="btn">
//               <span class="icon">💬</span> WHATSAPP MIWA NOW
//             </a>
            
//           </div>
//         </div>

//         <!-- Footer -->
//         <div class="footer">
//           <p style="margin: 0 0 10px 0;">
//             <span class="icon">🎂</span>
//             <strong style="color: #d63384;">Miwa Cakes & Treats</strong>
//           </p>
//           <p style="margin: 0; font-size: 14px; color: #888;">
//             Thank you for your order! We're excited to serve you delicious treats.<br>
//             Order ID: ${order.orderId} • ${new Date().toLocaleDateString()}
//           </p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// };

// module.exports = { getMiwaEmailTemplate, getCustomerEmailTemplate };
