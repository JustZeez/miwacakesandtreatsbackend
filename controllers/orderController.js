const Order = require('../models/Order');
const generateOrderId = require('../utils/orderIDGenerator');
const { sendOrderEmails } = require('../utils/emailSender');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create new order
const createOrder = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'Payment proof is required' });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path);
    
    // Generate order ID
    const orderId = generateOrderId(req.body.customerName);
    
    // Parse cart items
    let cartItems = [];
    let totalAmount = 0;
    
    try {
      cartItems = JSON.parse(req.body.cartItems);
      totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid cart items format' });
    }

    // Create order object
    const newOrder = new Order({
      orderId,
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      phone: req.body.phone,
      whatsapp: req.body.whatsapp,
      address: req.body.address,
      paymentProofUrl: uploadResult.secure_url,
      cartItems,
      totalAmount,
      status: 'pending'
    });

    // Save to database
    const savedOrder = await newOrder.save();

    // Send emails
    await sendOrderEmails(savedOrder);

    // Success response
    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        orderId: savedOrder.orderId,
        customerName: savedOrder.customerName,
        totalAmount: savedOrder.totalAmount
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: error.message 
    });
  }
};

// Get all orders (optional, for future admin panel)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById
};