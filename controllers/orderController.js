const Order = require("../models/Order");
const generateOrderId = require("../utils/orderIDGenerator");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getAdminDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [stats, recentOrders, topProducts] = await Promise.all([
      Order.aggregate([
        {
          $facet: {
            totalRevenue: [
              { $match: { status: { $ne: "cancelled" } } },
              { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ],
            ordersToday: [
              { $match: { createdAt: { $gte: today } } },
              { $count: "count" },
            ],
            pendingCount: [
              { $match: { status: "pending" } },
              { $count: "count" },
            ],
            deliveredCount: [
              { $match: { status: "delivered" } },
              { $count: "count" },
            ],
          },
        },
      ]),

      Order.find().sort({ createdAt: -1 }).limit(5),

      Order.aggregate([
        { $unwind: "$cartItems" },
        {
          $group: {
            _id: "$cartItems.name",
            sales: { $sum: "$cartItems.quantity" },
            revenue: { $sum: "$cartItems.netPrice" },
          },
        },
        { $sort: { sales: -1 } },
        { $limit: 5 },
      ]),
    ]);

    res.json({
      summary: {
        revenue: stats[0].totalRevenue[0]?.total || 0,
        ordersToday: stats[0].ordersToday[0]?.count || 0,
        pending: stats[0].pendingCount[0]?.count || 0,
        delivered: stats[0].deliveredCount[0]?.count || 0,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.orderId,
        customer: o.customerName,
        amount: `₦${o.totalAmount.toLocaleString()}`,
        items: o.cartItems.length,
        status: o.status,
        time: o.createdAt,
        avatar: o.customerName.charAt(0),
        color: "bg-pink-100 text-pink-700",
      })),
      topProducts: topProducts.map((p) => ({
        name: p._id,
        sales: p.sales,
        revenue: `₦${p.revenue.toLocaleString()}`,
        trend: "up",
      })),
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Dashboard calculation failed", details: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "Payment proof is required" });

    const fileDataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
      folder: "miwa-payments",
      resource_type: "auto",
    });

    const orderId = generateOrderId(req.body.customerName);
    const cartItems = JSON.parse(req.body.cartItems).map((item) => ({
      ...item,
      netPrice: item.price * item.quantity,
    }));

    const subtotal = cartItems.reduce((sum, item) => sum + item.netPrice, 0);
    const vat = subtotal > 10000 ? 50 : 0;

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
      totalAmount: subtotal + vat,
      status: "pending",
    });

    await newOrder.save();
    res.status(201).json({ success: true, orderId });
  } catch (error) {
    res.status(500).json({ error: "Creation failed", details: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      orderId: order.orderId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      phone: order.phone,
      whatsapp: order.whatsapp,
      address: order.address,
      paymentProofUrl: order.paymentProofUrl,
      cartItems: order.cartItems,
      subtotal: order.subtotal,
      vat: order.vat,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Update request: ID=${id}, Status=${status}`);

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "on delivery",
      "delivered",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findOneAndUpdate(
      {
        $or: [{ _id: id }, { orderId: id }],
      },
      {
        status: status,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!order) {
      console.log(`Order not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: `Order not found with ID: ${id}`,
      });
    }

    console.log(`Order updated: ${order.orderId} -> ${status}`);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: {
        _id: order._id,
        orderId: order.orderId,
        status: order.status,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOneAndDelete({
      $or: [{ orderId: id }, { _id: id }],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order deleted successfully",
      deletedOrder: order,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: error.message,
    });
  }
};

const trackOrder = async (req, res) => {
  try {
    console.log("=== TRACK ORDER REQUEST ===");
    console.log("Params:", req.params);
    console.log("Query:", req.query);
    
    const { orderId } = req.params;
    const { phone } = req.query;

    // Basic validation
    if (!orderId || !phone) {
      return res.status(400).json({
        success: false,
        message: "Order ID and Phone Number are required",
        received: { orderId, phone }
      });
    }

    // Clean inputs
    const cleanOrderId = orderId.trim();
    const cleanPhone = phone.trim();

    console.log("Searching for order with:", {
      cleanOrderId,
      cleanPhone
    });

    // Try to find the order
    const order = await Order.findOne({
      orderId: cleanOrderId, // Your model has orderId field
      phone: cleanPhone
    });

    console.log("Order found:", order ? "YES" : "NO");

    if (!order) {
      // List available orders for debugging
      try {
        const allOrders = await Order.find({})
          .select('orderId phone customerName -_id')
          .limit(10);
        console.log("First 10 orders in DB:", allOrders);
      } catch (dbError) {
        console.error("Error fetching orders:", dbError.message);
      }

      return res.status(404).json({
        success: false,
        message: "Order not found. Please check your Order ID and Phone Number.",
        searched: {
          orderId: cleanOrderId,
          phone: cleanPhone
        }
      });
    }

    // Format the response according to your model
    const orderResponse = {
      success: true,
      orderId: order.orderId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      phone: order.phone,
      whatsapp: order.whatsapp,
      address: order.address,
      cartItems: order.cartItems || [],
      subtotal: order.subtotal || 0,
      vat: order.vat || 0,
      totalAmount: order.totalAmount || 0,
      status: order.status || 'pending',
      orderDate: order.orderDate || order.createdAt, // Use orderDate from your model
      paymentProofUrl: order.paymentProofUrl
    };

    console.log("Returning order:", orderResponse.orderId);

    res.json(orderResponse);

  } catch (error) {
    console.error("=== TRACK ORDER ERROR ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    
    // Check if it's a MongoDB connection error
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return res.status(503).json({
        success: false,
        message: "Database connection error. Please try again later."
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error while tracking order",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
const adminLogin = (req, res) => {
  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    return res.status(500).json({
      success: false,
      message: "Admin password not configured",
    });
  }

  if (password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      token: ADMIN_PASSWORD,
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid password",
  });
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

module.exports = {
  getAdminDashboardStats,
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  trackOrder,
  adminLogin,
  getOrders,
};
