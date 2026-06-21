const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    whatsapp: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    paymentProofUrl: {
        type: String,
        required: true
    },
 
cartItems: [{
    _id: { type: String, required: true }, 
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
    subtotal: { 
        type: Number,
        required: true
    },
    vat: { 
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;