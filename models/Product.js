// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   price: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   image: {
//     type: String, // Cloudinary URL
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('Product', productSchema);
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String, // Cloudinary URL
    required: true
  },
  category: {  // ADD THIS - IMPORTANT!
    type: String,
    required: true,
    enum: ['Cakes', 'Pastries', 'Drinks', 'Snacks', 'Special'], // Your categories
    default: 'Cakes'
  },
  description: {  // ADD THIS
    type: String,
    default: ''
  },
  status: {  // ADD THIS - for available/unavailable
    type: String,
    enum: ['available', 'unavailable', 'coming-soon'],
    default: 'available'
  },
  inStock: {  // ADD THIS - boolean for stock status
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);