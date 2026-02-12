
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Order = require("../models/Order");
const { verifyAdmin } = require("../middleware/auth");
const upload = require("../middleware/uploads");
const cloudinary = require("cloudinary").v2;
const {
  getAdminDashboardStats,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  adminLogin,
  getOrders,
} = require("../controllers/orderController");

// ============ AUTH ============
router.post("/login", adminLogin);

// ============ DASHBOARD ============
router.get("/dashboard-stats", verifyAdmin, getAdminDashboardStats);

// ============ ORDERS ============
router.get("/orders", verifyAdmin, getAllOrders);
router.patch("/orders/:id/status", verifyAdmin, updateOrderStatus);
router.delete("/orders/:id", verifyAdmin, deleteOrder);
router.get("/all-orders", verifyAdmin, getOrders);


// POST /api/admin/products - Add new product
router.post("/products", verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    // ✅ FIX: Convert buffer to base64 for Cloudinary (works everywhere!)
    const fileStr = req.file.buffer.toString('base64');
    const fileUri = `data:${req.file.mimetype};base64,${fileStr}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(fileUri, {
      folder: "miwa-products",
    });

    // Create new product
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      image: uploadResult.secure_url,
      category: req.body.category || 'Cakes',
      description: req.body.description || '',
      status: req.body.status || 'available',
      inStock: req.body.inStock === 'true' || req.body.inStock === true,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ 
      error: "Failed to add product",
      details: error.message 
    });
  }
});

// DELETE /api/admin/products/:id - Delete product
router.delete("/products/:id", verifyAdmin, async (req, res) => {
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

// PUT /api/admin/products/:id - Update product
router.put("/products/:id", verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      description: req.body.description,
      status: req.body.status,
      inStock: req.body.inStock,
    };

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "miwa-products",
      });
      updateData.image = uploadResult.secure_url;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;