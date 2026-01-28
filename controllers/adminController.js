const Order = require('../models/Order'); // Adjust path to your model

exports.getAdminDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Run all calculations in parallel for maximum speed
    const [stats, recentOrders, topProducts] = await Promise.all([
      // 1. Calculate Summary Stats
      Order.aggregate([
        {
          $facet: {
            totalRevenue: [
              { $match: { status: { $ne: 'cancelled' } } },
              { $group: { _id: null, total: { $sum: "$amount" } } }
            ],
            ordersToday: [
              { $match: { createdAt: { $gte: today } } },
              { $count: "count" }
            ],
            pendingCount: [
              { $match: { status: "pending" } },
              { $count: "count" }
            ],
            deliveredCount: [
              { $match: { status: "delivered" } },
              { $count: "count" }
            ]
          }
        }
      ]),

      // 2. Fetch Recent Orders (Limited to 5 for the dashboard)
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name amount status createdAt items phone'),

      // 3. Simple Top Products Logic (Group by item name)
      Order.aggregate([
        { $unwind: "$items" }, // If items is an array
        { $group: { 
            _id: "$items", 
            sales: { $sum: 1 }, 
            revenue: { $sum: "$amount" } 
          } 
        },
        { $sort: { sales: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Format the data to match your frontend exactly
    const dashboardData = {
      summary: {
        revenue: stats[0].totalRevenue[0]?.total || 0,
        ordersToday: stats[0].ordersToday[0]?.count || 0,
        pending: stats[0].pendingCount[0]?.count || 0,
        delivered: stats[0].deliveredCount[0]?.count || 0
      },
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        customer: order.name,
        amount: `₦${order.amount.toLocaleString()}`,
        status: order.status,
        time: order.createdAt, // Frontend will format with timeago
        items: Array.isArray(order.items) ? order.items.length : 1
      })),
      topProducts: topProducts.map(p => ({
        name: p._id,
        sales: p.sales,
        revenue: `₦${p.revenue.toLocaleString()}`
      }))
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: "Error calculating dashboard data", error: error.message });
  }
};