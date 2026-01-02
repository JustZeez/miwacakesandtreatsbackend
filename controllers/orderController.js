const Order = require("../models/Order");
const generateOrderId = require("../utils/orderIDGenerator");
const { sendOrderEmails } = require("../utils/emailSender");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createOrder = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Payment proof is required" });
    }

    console.log("📁 File received via memory storage:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size + " bytes",
      buffer: req.file.buffer ? "Yes" : "No",
    });

    const fileBuffer = req.file.buffer;

    const fileBase64 = fileBuffer.toString("base64");

    const fileDataUri = `data:${req.file.mimetype};base64,${fileBase64}`;

    const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
      folder: "miwa-payments",
      resource_type: "auto",
    });

    console.log("✅ Cloudinary upload success:", uploadResult.secure_url);

    const orderId = generateOrderId(req.body.customerName);

    let cartItems = [];
    let subtotal = 0;
    let vat = 0;
    let totalAmount = 0;

    try {
      cartItems = JSON.parse(req.body.cartItems);

      cartItems = cartItems.map((item) => ({
        ...item,
        netPrice: item.price * item.quantity,
      }));

      subtotal = cartItems.reduce((sum, item) => sum + item.netPrice, 0);

      vat = subtotal > 10000 ? 50 : 0;

      totalAmount = subtotal + vat;
    } catch (error) {
      return res.status(400).json({ error: "Invalid cart items format" });
    }

    const newOrder = new Order({
      orderId,
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      phone: req.body.phone,
      whatsapp: req.body.whatsapp,
      address: req.body.address,
      paymentProofUrl: uploadResult.secure_url,
      cartItems,
      subtotal,
      vat,
      totalAmount,
      status: "pending",
    });

    const savedOrder = await newOrder.save();
    console.log("💾 Order saved to database:", savedOrder.orderId);

    await sendOrderEmails(savedOrder);
    console.log("📧 Emails sent successfully");

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: {
        orderId: savedOrder.orderId,
        customerName: savedOrder.customerName,
        subtotal: savedOrder.subtotal,
        vat: savedOrder.vat,
        totalAmount: savedOrder.totalAmount,
        paymentProofUrl: savedOrder.paymentProofUrl,
      },
    });
  } catch (error) {
    console.error("❌ Order creation error:", error.message);

    if (error.message.includes("Missing required parameter - file")) {
      console.error("Cloudinary issue: File not properly converted to base64");
    }

    if (error.message.includes("cloud_name is disabled")) {
      console.error("Cloudinary account issue: Check .env credentials");
    }

    res.status(500).json({
      error: "Failed to create order",
      details: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
};
