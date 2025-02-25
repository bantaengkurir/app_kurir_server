const express = require("express");

const router = express.Router();

const { validateToken } = require("../middlewares/auth")
const { index, create, getOrderById, cancelOrder, updateStatus, updateCourierLocation, indexCourier } = require("../controllers/order.controller")

// /api/babs
router.get("/", validateToken, index);
router.get("/courier&order", validateToken, indexCourier);
router.get("/:orderId", validateToken, getOrderById);
router.put("/:orderId/status", validateToken, updateStatus);
router.put("/update-location", validateToken, updateStatus);
router.post("/", validateToken, create);
router.put("/:orderId/cancel", validateToken, cancelOrder);


module.exports = router;