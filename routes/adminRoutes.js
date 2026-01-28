// routes/admin.js
const express = require('express');
const router = express.Router();
const { adminLogin, verifyAdmin } = require('../middleware/auth');
const { 
  getAdminDashboardStats, 
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');

// Debug middleware
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Admin: ${req.method} ${req.path}`);
  next();
});

// Public route
router.post('/login', adminLogin);

// Protected routes (require admin auth)
router.use(verifyAdmin);

// Admin dashboard routes
router.get('/dashboard-stats', getAdminDashboardStats);
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder); // Fixed typo: was "prders"

module.exports = router;