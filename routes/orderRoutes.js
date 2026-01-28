// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const upload = require('../middleware/uploads');

// Public routes
router.post('/', upload.single('paymentProof'), orderController.createOrder);
router.get('/track/:orderId', orderController.trackOrder);
router.get('/:id', orderController.getOrderById); // Public order view by ID

// Note: No getOrders route here - that's for admin only

module.exports = router;