const express = require("express");

const router = express.Router();

const { validateToken } = require("../middlewares/auth")
const {
    index,
    updateStatus,
    createPayment
} = require("../controllers/payment.controller")

// /api/babs
router.get("/", validateToken, index);
// router.get("/:orderId", validateToken, getOrderById);
router.put("/:order_id/status", validateToken, updateStatus);
router.post("/:order_id/payment-by-order", validateToken, createPayment);
// router.put("/:orderId/cancel", validateToken, cancelOrder);


module.exports = router;