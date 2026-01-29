const express = require("express");
const router = express.Router();
const { adminLogin, verifyAdmin } = require("../middleware/auth");
const {
  getAdminDashboardStats,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Admin: ${req.method} ${req.path}`);
  next();
});

router.post("/login", adminLogin);

router.use(verifyAdmin);

router.get("/dashboard-stats", getAdminDashboardStats);
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);
router.patch("/orders/:id/status", updateOrderStatus);
router.delete("/orders/:id", deleteOrder);

module.exports = router;
