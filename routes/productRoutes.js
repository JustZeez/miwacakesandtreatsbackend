const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { verifyAdmin } = require("../middleware/auth");
const upload = require("../middleware/uploads");
const cloudinary = require("cloudinary").v2;

// 1. GET all products (for displaying on website)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. POST - Admin adds new product
router.post("/admin/products", verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "miwa-products",
    });

    // Create new product
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      image: uploadResult.secure_url,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// 3. DELETE - Admin removes product
router.delete("/admin/products/:id", verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;