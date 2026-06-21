const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const upload = require("../middleware/uploads");

router.post("/", upload.single("paymentProof"), orderController.createOrder);
router.get("/track/:orderId", orderController.trackOrder);
router.get("/:id", orderController.getOrderById);

module.exports = router;
