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

// const trackOrder = async (req, res) => {
//   try {
//     const { orderId, phone } = req.query;

//     if (!orderId || !phone) {
//       return res
//         .status(400)
//         .json({ message: "Order ID and Phone Number are required" });
//     }

//     const order = await Order.findOne({
//       $or: [{ orderId }, { _id: orderId }],
//       phone: phone,
//     });

//     if (!order) {
//       return res
//         .status(404)
//         .json({ message: "Order not found. Please check your details." });
//     }

//     if (order.status === "delivered") {
//       return res.json({
//         delivered: true,
//         message: "Order has been delivered successfully!",
//       });
//     }

//     res.json(order);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params; // Get from URL params
    const { phone } = req.query;    // Get from query string

    console.log("=== TRACKING REQUEST ===");
    console.log("orderId (param):", orderId);
    console.log("phone (query):", phone);
    console.log("Full URL:", req.originalUrl);

    if (!orderId || !phone) {
      return res.status(400).json({ 
        message: "Order ID and Phone Number are required" 
      });
    }

    // Try multiple search patterns
    const order = await Order.findOne({
      $or: [
        { orderId: orderId },
        { _id: orderId }
      ],
      phone: phone
    });

    console.log("Found order:", order ? "YES" : "NO");
    
    if (!order) {
      // Log what's in database for debugging
      const allOrders = await Order.find({}).select('orderId phone');
      console.log("All orders in DB:", allOrders);
      
      return res.status(404).json({ 
        message: "Order not found. Please check your details.",
        debug: {
          searchedOrderId: orderId,
          searchedPhone: phone,
          availableOrders: allOrders.map(o => ({ orderId: o.orderId, phone: o.phone }))
        }
      });
    }

    if (order.status === "delivered") {
      return res.json({
        delivered: true,
        message: "Order has been delivered successfully!",
        order: order
      });
    }

    // Return order without sensitive data
    const { password, ...orderData } = order.toObject();
    res.json(orderData);
    
  } catch (error) {
    console.error("Track order error:", error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
