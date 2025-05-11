const express = require("express");

const router = express.Router();
const upload = require("../config/multer");

const { validateToken } = require("../middlewares/auth")
const { index, create, getOrderById, cancelOrder, updateStatus, updateCourierLocation, indexCourier, updateCourierAvailability } = require("../controllers/order.controller")

// /api/babs
router.get("/", validateToken, index);
router.get("/courier&order", validateToken, indexCourier);
router.get("/:orderId", validateToken, getOrderById);
router.put(
    "/:orderId/status",
    validateToken,
    upload.fields([
        { name: "purchase_receipt_photo", maxCount: 1 }, // Field untuk foto struk pembelian
        { name: "delivery_receipt_photo", maxCount: 1 }, // Field untuk foto bukti penerimaan
    ]),
    updateStatus
);
router.put("/update-location", validateToken, updateCourierLocation);
router.put("/availability", validateToken, updateCourierAvailability);
router.post("/", validateToken, create);
router.put("/:orderId/cancel", validateToken, cancelOrder);


module.exports = router;