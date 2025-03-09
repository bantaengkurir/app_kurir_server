const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/auth")
const { createTransaction, handleNotification } = require("../controllers/midtrans.controller");

// Endpoint untuk membuat transaksi Midtrans
router.post("/create-transaction", validateToken, createTransaction);

// Endpoint untuk menangani notifikasi dari Midtrans
router.post("/notification", handleNotification);

module.exports = router;