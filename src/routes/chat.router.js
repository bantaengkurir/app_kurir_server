// const express = require('express');
// const { getChatsByUserId, sendMessage } = require('../controllers/chat.controller');

// 


// const router = express.Router();

// // Route untuk mendapatkan semua chat berdasarkan userId
// router.get('/', getChatsByUserId);

// // Route untuk mengirim pesan baru
// router.post('/messages', sendMessage);

// module.exports = router;


const express = require("express");
const { getMessages, sendMessage, getUsersForSidebar } = require("../controllers/chat.controller")

const router = express.Router();

const { validateToken } = require("../middlewares/auth")

router.get("/users", validateToken, getUsersForSidebar);
router.get("/:id", validateToken, getMessages);

router.post("/send/:id", validateToken, sendMessage);

module.exports = router;