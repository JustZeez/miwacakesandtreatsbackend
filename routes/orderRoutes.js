// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const upload = require('../middleware/upload');

// Create new order (with file upload)
router.post('/', upload.single('paymentProof'), orderController.createOrder);

// Get all orders
router.get('/', orderController.getOrders);

// Get single order by ID
router.get('/:id', orderController.getOrderById);

module.exports = router;