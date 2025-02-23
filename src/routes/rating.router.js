const express = require("express");

const router = express.Router();

const { validateToken } = require("../middlewares/auth")
const { indexProduct, indexCourier, createRatProduct, createRatCourier, updateRatProduct, updateRatCourier } = require("../controllers/rating.controller")

// /api/babs
router.get("/", validateToken, indexProduct);
router.get("/courier", validateToken, indexCourier);
router.put("/", validateToken, updateRatProduct);
router.put("/courier", validateToken, updateRatCourier);
router.post("/", validateToken, createRatProduct);
router.post("/courier", validateToken, createRatCourier);


module.exports = router;