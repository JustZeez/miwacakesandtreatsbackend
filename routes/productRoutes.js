// const express = require("express");
// const router = express.Router();
// const Product = require("../models/Product");
// const { verifyAdmin } = require("../middleware/auth");
// const upload = require("../middleware/uploads");
// const cloudinary = require("cloudinary").v2;

// // ============ PUBLIC ROUTES ============

// // 1. GET all products (with optional filtering)
// router.get("/", async (req, res) => {
//   try {
//     const { status, inStock, category } = req.query;
//     let query = {};
    
//     if (status) query.status = status;
//     if (inStock !== undefined) query.inStock = inStock === 'true';
//     if (category) query.category = category;
    
//     const products = await Product.find(query).sort({ createdAt: -1 });
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // 2. GET single product by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }
//     res.json(product);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // ============ ADMIN ROUTES ============

// // 3. POST - Admin adds new product (RELATIVE PATH - NO /api)
// router.post("/admin", verifyAdmin, upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "Image is required" });
//     }

//     const uploadResult = await cloudinary.uploader.upload(req.file.path, {
//       folder: "miwa-products",
//     });

//     const product = new Product({
//       name: req.body.name,
//       price: req.body.price,
//       image: uploadResult.secure_url,
//       category: req.body.category || 'Cakes',
//       description: req.body.description || '',
//       status: req.body.status || 'available',
//       inStock: req.body.inStock === 'true' || req.body.inStock === true,
//     });

//     await product.save();
//     res.status(201).json(product);
//   } catch (error) {
//     console.error("Error adding product:", error);
//     res.status(500).json({ error: "Failed to add product" });
//   }
// });

// // 4. DELETE - Admin removes product (RELATIVE PATH - NO /api)
// router.delete("/admin/:id", verifyAdmin, async (req, res) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.id);
    
//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }
    
//     res.json({ message: "Product deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // 5. PUT - Admin updates product
// router.put("/admin/:id", verifyAdmin, upload.single("image"), async (req, res) => {
//   try {
//     const updateData = {
//       name: req.body.name,
//       price: req.body.price,
//       category: req.body.category,
//       description: req.body.description,
//       status: req.body.status,
//       inStock: req.body.inStock,
//     };

//     if (req.file) {
//       const uploadResult = await cloudinary.uploader.upload(req.file.path, {
//         folder: "miwa-products",
//       });
//       updateData.image = uploadResult.secure_url;
//     }

//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     );

//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     res.json(product);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products - Get all products (with optional filtering)
router.get("/", async (req, res) => {
  try {
    const { status, inStock, category } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (inStock !== undefined) query.inStock = inStock === 'true';
    if (category) query.category = category;
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id - Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;