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
const upload = require('../middlewares/upload');
const { getMessages, sendMessage, getUsersForSidebar, sendMessageWeb } = require("../controllers/chat.controller")

const router = express.Router();

const { validateToken } = require("../middlewares/auth")

router.get("/users", validateToken, getUsersForSidebar);
router.get("/:id", validateToken, getMessages);

router.post("/send/:id", validateToken, upload.single('image'), sendMessage);
router.post("/send-web/:id", validateToken, upload.single('image'), sendMessageWeb);

module.exports = router;