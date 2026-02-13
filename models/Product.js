const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Cakes", "Pastries", "Drinks", "Snacks", "Special"],
    default: "Cakes",
  },
  description: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["available", "unavailable", "coming-soon"],
    default: "available",
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
