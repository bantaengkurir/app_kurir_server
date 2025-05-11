const {
    payment: PaymentModel,
    order: OrderModel,
    shipping_cost: ShippingModel,
    orderitem: OrderItemModel,
    product: ProductModel,
    order_historie: OrderHistoryModel,
} = require("../models");
const express = require("express");

const router = express.Router();

const { validateToken } = require("../middlewares/auth")
const {
    index,
    updateStatus,
    createPayment,
    handleMidtransNotification
} = require("../controllers/payment.controller")

// /api/babs
router.get("/", validateToken, index);
// router.get("/:orderId", validateToken, getOrderById);
router.put("/:order_id/status", validateToken, updateStatus);
router.post("/midtrans-notifications", handleMidtransNotification);
router.post("/:order_id/payment-by-order", validateToken, createPayment);
// router.put("/midtrans-notifications", validateToken, handleMidtransNotification);


module.exports = router;