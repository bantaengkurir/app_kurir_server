// // const { chat: ChatModel, message: MessageModel, user: UserModel } = require("../models");
// // const socketIo = require('socket.io');

// // // Fungsi untuk membuat percakapan baru dengan validasi role
// // const createChat = async(receiverId, senderId) => {
// //     try {
// //         // Ambil data user berdasarkan id
// //         const sender = await UserModel.findByPk(senderId);
// //         const receiver = await UserModel.findByPk(receiverId);

// //         // Validasi role pengirim dan penerima
// //         if (
// //             (sender.role === 'customer' && (receiver.role === 'seller' || receiver.role === 'courier')) ||
// //             (sender.role === 'seller' && receiver.role === 'customer') ||
// //             (sender.role === 'courier' && receiver.role === 'customer')
// //         ) {
// //             // Buat chat jika valid
// //             const newChat = await ChatModel.create({
// //                 receiver_id: receiverId,
// //                 sender_id: senderId,
// //             });
// //             console.log('Chat Created:', newChat.id);
// //             return newChat;
// //         } else {
// //             throw new Error('Invalid user roles for chat');
// //         }
// //     } catch (error) {
// //         console.error('Error creating chat:', error);
// //         throw error;
// //     }
// // };

// // // Fungsi untuk mengirim pesan
// // const sendMessage = async(chatId, senderId, messageContent) => {
// //     try {
// //         const newMessage = await MessageModel.create({
// //             chat_id: chatId,
// //             sender_id: senderId,
// //             message: messageContent,
// //         });

// //         return {
// //             id: newMessage.id,
// //             chatId: newMessage.chat_id,
// //             senderId: newMessage.sender_id,
// //             message: newMessage.message,
// //             createdAt: newMessage.createdAt,
// //         };
// //     } catch (error) {
// //         console.error('Error sending message:', error);
// //         throw error;
// //     }
// // };


// // // Fungsi untuk mendapatkan pesan dalam sebuah chat
// // const getMessages = async(chatId) => {
// //     try {
// //         const messages = await MessageModel.findAll({
// //             where: { chat_id: chatId },
// //             include: [{ model: UserModel, as: 'sender' }],
// //         });
// //         console.log('Messages:', messages);
// //         return messages;
// //     } catch (error) {
// //         console.error('Error fetching messages:', error);
// //         throw error;
// //     }
// // };

// // // Menambahkan socket.io untuk chat room
// // const setupSocket = (io) => {
// //     io.on('connection', (socket) => {
// //         console.log('A user connected');

// //         // Bergabung ke chat room berdasarkan chatId
// //         socket.on('joinChat', (chatId) => {
// //             socket.join(chatId);
// //             console.log(`User joined chat room: ${chatId}`);
// //         });

// //         // Menangani event disconnect
// //         socket.on('disconnect', () => {
// //             console.log('A user disconnected');
// //         });
// //     });
// // };

// // module.exports = {
// //     createChat,
// //     sendMessage,
// //     getMessages,
// //     setupSocket
// // };

// // const { chat: ChatModel, message: MessageModel } = require('../models');

// // // Get chat history
// // const getChatHistory = async(req, res) => {
// //     try {
// //         const chatId = req.params.chatId;
// //         if (!chatId) {
// //             return res.status(400).json({ message: 'Chat ID is required' });
// //         }
// //         const messages = await MessageModel.findAll({ where: { chat_id: chatId } });
// //         res.json(messages);
// //     } catch (error) {
// //         console.error(error);
// //         res.status(500).json({ message: 'Error retrieving chat history' });
// //     }
// // };

// // // Send message
// // const sendMessage = async(req, res) => {
// //     try {
// //         const { chatId, senderId, message } = req.body;
// //         if (!chatId || !senderId || !message) {
// //             return res.status(400).json({ message: 'Chat ID, Sender ID, and Message are required' });
// //         }
// //         const newMessage = await MessageModel.create({
// //             chat_id: chatId,
// //             sender_id: senderId,
// //             message: message
// //         });
// //         req.io.to(chatId).emit('receiveMessage', newMessage); // Emit message to the chat room
// //         res.json(newMessage);
// //     } catch (error) {
// //         console.error(error);
// //         res.status(500).json({ message: 'Error sending message' });
// //     }
// // };

// // module.exports = { getChatHistory, sendMessage };

// // const { Op } = require('sequelize');
// // const { chat: ChatModel, message: MessageModel, user: UserModel } = require('../models');

// // // Mendapatkan semua chat untuk user tertentu
// // const getChatsByUserId = async(req, res) => {
// //     const { userId } = req.params;
// //     try {
// //         const chats = await ChatModel.findAll(
// //             //     {
// //             //     where: {
// //             //         [Op.or]: [{ sender_id: userId }, { receiver_id: userId }],
// //             //     },
// //             //     include: [
// //             //         { model: UserModel, as: 'sender', attributes: ['id', 'name'] },
// //             //         { model: UserModel, as: 'receiver', attributes: ['id', 'name'] },
// //             //     ],
// //             // }
// //         );
// //         res.json(chats);
// //     } catch (error) {
// //         res.status(500).json({ message: 'Failed to fetch chats', error: error.message });
// //     }
// // };

// // // Mengirim pesan baru
// // const sendMessage = async(req, res) => {
// //     const { chat_id, sender_id, message } = req.body;
// //     try {
// //         const newMessage = await MessageModel.create({ chat_id, sender_id, message });
// //         res.status(201).json(newMessage);
// //     } catch (error) {
// //         res.status(500).json({ message: 'Failed to send message', error: error.message });
// //     }
// // };

// // module.exports = {
// //     getChatsByUserId,
// //     sendMessage,
// // };

// // const { message: MessageModel, user: UserModel } = require("../models");

// // const cloudinary = require("../config/cloudinary.js");
// // const { getReceiverSocketId, io } = require("../config/socket.js");

// // const getUsersForSidebar = async(req, res) => {
// //     try {
// //         const loggedInUserId = req.user.id;
// //         const filteredUsers = await UserModel.find({ id: { $ne: loggedInUserId } }).select("-password");

// //         res.status(200).json(filteredUsers);

// //         console.log("filteredUsers: ", loggedInUserId);
// //     } catch (error) {
// //         console.error("Error in getUsersForSidebar: ", error.message);
// //         res.status(500).json({ error: "Internal server error" });
// //     }
// // };

// // const getMessages = async(req, res) => {
// //     try {
// //         const { id: userToChatId } = req.params;
// //         const myId = req.user.id;

// //         const messages = await MessageModel.find({
// //             $or: [
// //                 { senderId: myId, receiver_id: userToChatId },
// //                 { senderId: userToChatId, receiver_id: myId },
// //             ],
// //         });

// //         res.status(200).json(messages);
// //     } catch (error) {
// //         console.log("Error in getMessages controller: ", error.message);
// //         res.status(500).json({ error: "Internal server error" });
// //     }
// // };

// // const sendMessage = async(req, res) => {
// //     try {
// //         const { text, image } = req.body;
// //         const { id: receiverId } = req.params;
// //         const senderId = req.user.id;

// //         let imageUrl;
// //         if (image) {
// //             // Upload base64 image to cloudinary
// //             const uploadResponse = await cloudinary.uploader.upload(image);
// //             imageUrl = uploadResponse.secure_url;
// //         }

// //         const newMessage = new Message({
// //             senderId,
// //             receiverId,
// //             text,
// //             image: imageUrl,
// //         });

// //         await newMessage.save();

// //         const receiverSocketId = getReceiverSocketId(receiverId);
// //         if (receiverSocketId) {
// //             io.to(receiverSocketId).emit("newMessage", newMessage);
// //         }

// //         res.status(201).json(newMessage);
// //     } catch (error) {
// //         console.log("Error in sendMessage controller: ", error.message);
// //         res.status(500).json({ error: "Internal server error" });
// //     }
// // };

// // module.exports = { getUsersForSidebar, getMessages, sendMessage };
// // module.exports = {
// //     getChatsByUserId,
// //     sendMessage,
// // };

// // const { message, User } = require("../models"); // Model Sequelize
// // const cloudinary = require("../config/cloudinary.js");
// // const { getReceiverSocketId, io } = require("../config/socket.js");
// // const { Op } = require("sequelize");

// // // Mendapatkan daftar pengguna untuk sidebar
// // const getUsersForSidebar = async(req, res) => {
// //     try {
// //         const loggedInUserId = req.user.id;

// //         // Ambil semua pengguna kecuali yang sedang login
// //         const filteredUsers = await User.findAll({
// //             where: {
// //                 id: {
// //                     [Op.ne]: loggedInUserId,
// //                 },
// //             },
// //             attributes: { exclude: ["password"] }, // Kecualikan kolom password
// //         });

// //         res.status(200).json(filteredUsers);
// //         console.log("filteredUsers: ", filteredUsers);
// //     } catch (error) {
// //         console.error("Error in getUsersForSidebar: ", error.message);
// //         res.status(500).json({ error: "Internal server error" });
// //     }
// // };

// // // Mendapatkan pesan antara pengguna yang sedang login dan pengguna lain
// // const getMessages = async(req, res) => {
// //     try {
// //         const { id: userToChatId } = req.params; // ID pengguna lain
// //         const myId = req.user.id; // ID pengguna yang sedang login

// //         // Ambil semua pesan yang melibatkan kedua pengguna
// //         const messages = await Message.findAll({
// //             where: {
// //                 [Op.or]: [
// //                     { senderId: myId, receiverId: userToChatId },
// //                     { senderId: userToChatId, receiverId: myId },
// //                 ],
// //             },
// //             order: [
// //                 ["createdAt", "ASC"]
// //             ], // Urutkan berdasarkan waktu pengiriman
// //         });

// //         res.status(200).json(messages);
// //     } catch (error) {
// //         console.error("Error in getMessages controller: ", error.message);
// //         res.status(500).json({ error: "Internal server error" });
// //     }
// // };

// // // Mengirim pesan
// // const sendMessage = async(req, res) => {
// //     try {
// //         const { text, image } = req.body; // Pesan teks dan gambar
// //         const { id: receiverId } = req.params; // ID penerima
// //         const senderId = req.user.id; // ID pengirim

// //         let imageUrl = null;

// //         // Jika ada gambar, upload ke Cloudinary
// //         if (image) {
// //             const uploadResponse = await cloudinary.uploader.upload(image, {
// //                 folder: "chat_images", // Folder khusus di Cloudinary
// //             });
// //             imageUrl = uploadResponse.secure_url;
// //         }

// //         // Simpan pesan ke database
// //         const newMessage = await Message.create({
// //             senderId,
// //             receiverId,
// //             text,
// //             image: imageUrl,
// //         });

// //         // Kirim pesan ke penerima melalui socket jika online
// //         const receiverSocketId = getReceiverSocketId(receiverId);
// //         if (receiverSocketId) {
// //             io.to(receiverSocketId).emit("newMessage", newMessage);
// //         }

// //         res.status(201).json(newMessage);
// //     } catch (error) {
// //         console.error("Error in sendMessage controller: ", error.message);
// //         res.status(500).json({ error: "Internal server error" });
// //     }
// // };

// // module.exports = { getUsersForSidebar, getMessages, sendMessage };

// const { message: Message, user: User } = require("../models"); // Model Sequelize
// const cloudinary = require("../config/cloudinary.js");
// const { getReceiverSocketId, io } = require("../config/socket.js");
// const { getOnlineUsers } = require("../config/socket"); // Import fungsi dari config/socket.js
// const { Op } = require("sequelize");

// // // Mendapatkan daftar pengguna untuk sidebar
// // const getUsersForSidebar = async(req, res) => {
// //     try {
// //         const loggedInUserId = req.user.id;

// //         // Ambil semua pengguna kecuali yang sedang login
// //         const filteredUsers = await User.findAll({
// //             where: {
// //                 id: {
// //                     [Op.ne]: loggedInUserId,
// //                 },
// //             },
// //             attributes: { exclude: ["password"] }, // Kecualikan kolom password
// //         });

// //         res.status(200).json(filteredUsers);
// //         console.log("filteredUsers: ", filteredUsers);
// //     } catch (error) {
// //         console.error("Error in getUsersForSidebar: ", error.message);
// //         res.status(500).json({ error: "Internal server error" });
// //     }
// // };

// const getUsersForSidebar = async(req, res) => {
//     try {
//         const loggedInUserId = req.user.id;

//         // Ambil semua pengguna kecuali yang sedang login
//         const allUsers = await User.findAll({
//             where: {
//                 id: {
//                     [Op.ne]: loggedInUserId,
//                 },
//             },
//             attributes: { exclude: ["password"] }, // Kecualikan kolom password
//         });

//         // Ambil daftar kurir yang online dari socket.io
//         const onlineUsers = getOnlineUsers();

//         // Tandai pengguna yang online
//         const usersWithOnlineStatus = allUsers.map(user => {
//             // Cek apakah user ini adalah kurir dan apakah mereka online
//             const isOnline = onlineUsers.some(user => user === user.id); // Pastikan ID pengguna ada dalam daftar onlineUsers
//             return {
//                 ...user.toJSON(),
//                 isOnline, // Tambahkan status online
//             };
//         });

//         res.status(200).json(usersWithOnlineStatus);
//         console.log("Users with online status:", usersWithOnlineStatus);
//     } catch (error) {
//         console.error("Error in getUsersForSidebar:", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

// // Mendapatkan pesan antara pengguna yang sedang login dan pengguna lain
// const getMessages = async(req, res) => {
//     try {
//         const { id: userToChatId } = req.params; // ID pengguna lain
//         const myId = req.user.id; // Pastikan menggunakan `req.user` (huruf kecil)

//         // Ambil semua pesan yang melibatkan kedua pengguna
//         const messages = await Message.findAll({
//             where: {
//                 [Op.or]: [
//                     { sender_id: myId, receiver_id: userToChatId },
//                     { sender_id: userToChatId, receiver_id: myId },
//                 ],
//             },
//             order: [
//                 ["createdAt", "ASC"]
//             ], // Urutkan berdasarkan waktu pengiriman
//         });

//         res.status(200).json(messages);
//     } catch (error) {
//         console.error("Error in getMessages controller: ", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };


// // Mengirim pesan
// const sendMessage = async(req, res) => {
//     try {
//         const { text, img_url } = req.body; // Pesan teks dan gambar
//         const { id: receiver_id } = req.params; // ID penerima
//         const sender_id = req.user.id; // ID pengirim

//         let image = img_url;

//         // Jika ada gambar, upload ke Cloudinary
//         if (image) {
//             const uploadResponse = await cloudinary.uploader.upload(image, {
//                 folder: "chat_image", // Folder khusus di Cloudinary
//             });
//             image = uploadResponse.secure_url;
//         }

//         console.log("image:", image);

//         // console.log("Request body:", req.body);

//         // if (!req.file) {
//         //     return res.status(400).send({ message: "Gambar tidak ditemukan, pastikan gambar diunggah dengan benar" });
//         // }

//         // const image = req.file.path; // Cloudinary URL

//         // Simpan pesan ke database
//         const newMessage = await Message.create({
//             sender_id,
//             receiver_id,
//             text,
//             img_url: image,
//         });
//         const socketIdMap = {};

//         const getReceiverSocketId = (receiver_id) => {
//             return socketIdMap[receiver_id];
//         };

//         // Kirim pesan ke penerima melalui socket jika online
//         const receiverSocketId = getReceiverSocketId(receiver_id);
//         if (receiverSocketId) {
//             io.to(receiverSocketId).emit("newMessage", newMessage);
//         }

//         res.status(201).json(newMessage);
//     } catch (error) {
//         console.error("Error in sendMessage controller: ", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

// module.exports = { getUsersForSidebar, getMessages, sendMessage };











// // const { message: Message, user: User } = require("../models");
// // const { getReceiverSocketId, io } = require("../config/socket");
// // const { getOnlineUsers } = require("../config/socket");
// // const { Op } = require("sequelize");

// // // Mendapatkan daftar pengguna untuk sidebar
// // const getUsersForSidebar = async(req, res) => {
// //     try {
// //         const loggedInUserId = req.user.id;

// //         // Ambil semua pengguna kecuali yang sedang login
// //         const allUsers = await User.findAll({
// //             where: {
// //                 id: {
// //                     [Op.ne]: loggedInUserId
// //                 }
// //             },
// //             attributes: { exclude: ["password"] }, // Kecualikan kolom password
// //         });

// //         // Ambil daftar kurir yang online dari socket.io
// //         const onlineCouriers = getOnlineCouriers();

// //         // Tandai pengguna yang online
// //         const usersWithOnlineStatus = allUsers.map((user) => {
// //             const isOnline = onlineCouriers.some((courier) => courier === user.id);
// //             return {
// //                 ...user.toJSON(),
// //                 isOnline, // Tambahkan status online
// //             };
// //         });

// //         res.status(200).json(usersWithOnlineStatus);
// //         console.log("Users with online status:", usersWithOnlineStatus);
// //     } catch (error) {
// //         console.error("Error in getUsersForSidebar:", error.message);
// //         res.status(500).json({ error: "Internal server error" });
// //     }
// // };

// // // Mendapatkan pesan antara pengguna yang sedang login dan pengguna lain
// // const getMessages = async(req, res) => {
// //     try {
// //         const { id: userToChatId } = req.params; // ID pengguna lain
// //         const myId = req.user.id; // ID pengirim

// //         // Ambil semua pesan yang melibatkan kedua pengguna
// //         const messages = await Message.findAll({
// //             where: {
// //                 [Op.or]: [
// //                     { sender_id: myId, receiver_id: userToChatId },
// //                     { sender_id: userToChatId, receiver_id: myId },
// //                 ],
// //             },
// //             order: [
// //                 ["createdAt", "ASC"]
// //             ], // Urutkan berdasarkan waktu pengiriman
// //         });

// //         res.status(200).json(messages);
// //     } catch (error) {
// //         console.error("Error in getMessages controller:", error.message);
// //         res.status(500).json({ error: "Internal server error" });
// //     }
// // };

// // const sendMessage = async(req, res) => {
// //     try {
// //         const { message, image } = req.body; // Pesan teks dan gambar
// //         const { id: receiver_id } = req.params; // ID penerima
// //         const sender_id = req.user.id; // ID pengirim

// //         // Simpan pesan ke database
// //         const newMessage = await Message.create({
// //             sender_id,
// //             receiver_id,
// //             message,
// //         });

// //         // Kirim pesan ke penerima melalui socket jika online
// //         const receiverSocketId = getReceiverSocketId(receiver_id);
// //         if (receiverSocketId) {
// //             io.to(receiverSocketId).emit("newMessage", newMessage);
// //         }

// //         res.status(201).json(newMessage);
// //     } catch (error) {
// //         console.error("Error in sendMessage controller:", error.message);
// //         res.status(500).json({ error: "Internal server error" });
// //     }
// // };


// // module.exports = { getUsersForSidebar, getMessages, sendMessage };


// const { message: Message, user: User } = require("../models");
// const cloudinary = require("../config/cloudinary.js");
// const { getReceiverSocketId, io, getOnlineUsers } = require("../config/socket");
// const { Op } = require("sequelize");

// // Mendapatkan daftar pengguna untuk sidebar
// const getUsersForSidebar = async(req, res) => {
//     try {
//         const loggedInUserId = req.user.id;

//         const allUsers = await User.findAll({
//             where: { id: {
//                     [Op.ne]: loggedInUserId } },
//             attributes: { exclude: ["password"] },
//         });

//         const onlineUsers = getOnlineUsers();

//         const usersWithOnlineStatus = allUsers.map(user => ({
//             ...user.toJSON(),
//             isOnline: onlineUsers.includes(user.id),
//         }));

//         res.status(200).json(usersWithOnlineStatus);
//     } catch (error) {
//         console.error("Error in getUsersForSidebar:", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

// // Mengambil pesan antara pengguna yang sedang login dan pengguna lain
// const getMessages = async(req, res) => {
//     try {
//         const { id: userToChatId } = req.params;
//         const myId = req.user.id;

//         const messages = await Message.findAll({
//             where: {
//                 [Op.or]: [
//                     { sender_id: myId, receiver_id: userToChatId },
//                     { sender_id: userToChatId, receiver_id: myId },
//                 ],
//             },
//             order: [
//                 ["createdAt", "ASC"]
//             ],
//         });

//         res.status(200).json(messages);
//     } catch (error) {
//         console.error("Error in getMessages controller:", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

// // Mengirim pesan
// const sendMessage = async(req, res) => {
//     try {
//         const { text, img_url } = req.body;
//         const { id: receiver_id } = req.params;
//         const sender_id = req.user.id;

//         let image = img_url;

//         if (image) {
//             const uploadResponse = await cloudinary.uploader.upload(image, {
//                 folder: "chat_image",
//             });
//             image = uploadResponse.secure_url;
//         }

//         const newMessage = await Message.create({
//             sender_id,
//             receiver_id,
//             text,
//             img_url: image,
//         });

//         const receiverSocketId = getReceiverSocketId(receiver_id);
//         if (receiverSocketId) {
//             io.to(receiverSocketId).emit("newMessage", newMessage);
//         }

//         res.status(201).json(newMessage);
//     } catch (error) {
//         console.error("Error in sendMessage controller:", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

// module.exports = { getUsersForSidebar, getMessages, sendMessage };


const { message: Message, user: User } = require("../models"); // Model Sequelize
const cloudinary = require("../config/cloudinary.js");
const { getReceiverSocketId, io } = require("../config/socket.js"); // Impor dari socket.js
const { getOnlineUsers } = require("../config/socket"); // Import fungsi dari config/socket.js
const { Op } = require("sequelize");

// const getUsersForSidebar = async(req, res) => {
//     try {
//         const loggedInUserId = req.user.id;

//         // Ambil semua pengguna kecuali yang sedang login
//         const allUsers = await User.findAll({
//             where: {
//                 id: {
//                     [Op.ne]: loggedInUserId,
//                 },
//             },
//             attributes: { exclude: ["password"] }, // Kecualikan kolom password
//         });

//         // Ambil daftar kurir yang online dari socket.io
//         const onlineUsers = getOnlineUsers();

//         // Tandai pengguna yang online
//         const usersWithOnlineStatus = allUsers.map(user => {
//             // Cek apakah user ini adalah kurir dan apakah mereka online
//             const isOnline = onlineUsers.some(user => user === user.id); // Pastikan ID pengguna ada dalam daftar onlineUsers
//             return {
//                 ...user.toJSON(),
//                 isOnline, // Tambahkan status online
//             };
//         });

//         res.status(200).json(usersWithOnlineStatus);
//         console.log("Users with online status:", usersWithOnlineStatus);
//     } catch (error) {
//         console.error("Error in getUsersForSidebar:", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

const getUsersForSidebar = async(req, res) => {
    try {
        const loggedInUserId = req.user.id;

        // Ambil semua pengguna kecuali yang sedang login
        const allUsers = await User.findAll({
            where: {
                id: {
                    [Op.ne]: loggedInUserId,
                },
            },
            attributes: { exclude: ["password"] }, // Kecualikan kolom password
        });

        // Ambil semua pesan yang melibatkan pengguna yang sedang login
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { sender_id: loggedInUserId }, // Pesan yang dikirim oleh pengguna yang sedang login
                    { receiver_id: loggedInUserId }, // Pesan yang diterima oleh pengguna yang sedang login
                ],
            },
            include: [{
                    model: User,
                    as: 'sender', // Gunakan alias yang sesuai
                },
                {
                    model: User,
                    as: 'receiver', // Gunakan alias yang sesuai
                },
            ],
        });

        // Buat daftar ID pengguna yang memiliki chat dengan pengguna yang sedang login
        const userIdsWithChat = new Set();
        messages.forEach(message => {
            if (message.sender_id === loggedInUserId) {
                userIdsWithChat.add(message.receiver_id); // Tambahkan ID penerima
            } else {
                userIdsWithChat.add(message.sender_id); // Tambahkan ID pengirim
            }
        });

        // Filter pengguna yang memiliki chat dengan pengguna yang sedang login
        const usersWithChat = allUsers.filter(user => userIdsWithChat.has(user.id));

        // Ambil daftar pengguna yang online dari socket.io
        const onlineUsers = getOnlineUsers();

        // Tandai pengguna yang online
        const usersWithOnlineStatus = usersWithChat.map(user => {
            const isOnline = onlineUsers.some(onlineUser => onlineUser === user.id);
            return {
                ...user.toJSON(),
                isOnline, // Tambahkan status online
            };
        });

        res.status(200).json(usersWithOnlineStatus);
        // console.log("Users with chat and online status:", usersWithOnlineStatus);
    } catch (error) {
        console.error("Error in getUsersForSidebar:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};



const getMessages = async(req, res) => {
    try {
        const { id: userToChatId } = req.params; // ID pengguna lain
        const myId = req.user.id; // Pastikan menggunakan `req.user` (huruf kecil)

        // Ambil semua pesan yang melibatkan kedua pengguna
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { sender_id: myId, receiver_id: userToChatId },
                    { sender_id: userToChatId, receiver_id: myId },
                ],
            },
            order: [
                ["createdAt", "ASC"]
            ], // Urutkan berdasarkan waktu pengiriman
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

//ini berhasil web
const sendMessageWeb = async(req, res) => {
    try {
        const { text, img_url } = req.body; // Pesan teks dan gambar
        const { id: receiver_id } = req.params; // ID penerima
        const sender_id = req.user.id; // ID pengirim

        let image = img_url;

        // Jika ada gambar, upload ke Cloudinary
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: "chat_image", // Folder khusus di Cloudinary
            });
            image = uploadResponse.secure_url;
        }

        console.log("image:", image);

        // Simpan pesan ke database
        const newMessage = await Message.create({
            sender_id,
            receiver_id,
            text,
            img_url: image,
        });

        console.log('newmessage', newMessage)

        // Kirim pesan ke penerima melalui socket jika online
        const receiverSocketId = getReceiverSocketId(receiver_id);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// const sendMessage = async (req, res) => {
//     try {
//       console.log('Request body:', req.body); // Debug text
//       console.log('Request file:', req.file); // Debug image

//       // Handle both possible text fields
//       const text = req.body.text || req.body.message || null;

//       // Process image if exists
//       let imageUrl = null;
//       if (req.file) {
//         const result = await new Promise((resolve, reject) => {
//           const uploadStream = cloudinary.uploader.upload_stream(
//             { folder: "chat_images" },
//             (error, result) => {
//               if (error) reject(error);
//               else resolve(result);
//             }
//           );
//           uploadStream.end(req.file.buffer);
//         });
//         imageUrl = result.secure_url;
//       }

//       // Create message with proper error handling
//       const newMessage = await Message.create({
//         sender_id: req.user.id,
//         receiver_id: req.params.id,
//         text: text,
//         img_url: imageUrl
//       });

//       res.status(201).json(newMessage);
//     } catch (error) {
//       console.error('Error details:', {
//         message: error.message,
//         stack: error.stack,
//         receivedData: {
//           text: req.body.text || req.body.message,
//           file: req.file ? true : false
//         }
//       });
//       res.status(500).json({ 
//         error: "Internal server error",
//         details: error.message 
//       });
//     }
//   };

//ini berhasil android
// const sendMessage = async(req, res) => {
//     try {
//         console.log('Received fields:', req.body);
//         console.log('Received file info:', {
//             originalname: req.file.originalname,
//             size: req.file.size
//         });

//         // 1. Handle text (ambil dari salah satu field)
//         const text = req.body.text || req.body.message || null;

//         // 2. Process image upload
//         let imageUrl = null;
//         if (req.file) {
//             console.log('Uploading image to Cloudinary...');

//             // Gunakan promise-based upload
//             const uploadResult = await new Promise((resolve, reject) => {
//                 const uploadStream = cloudinary.uploader.upload_stream({ folder: "chat_images" },
//                     (error, result) => {
//                         if (error) {
//                             console.error('Cloudinary upload error:', error);
//                             reject(error);
//                         } else {
//                             console.log('Cloudinary upload success:', result.secure_url);
//                             resolve(result);
//                         }
//                     }
//                 );

//                 uploadStream.end(req.file.buffer);
//             });

//             imageUrl = uploadResult.secure_url;
//         }

//         // 3. Create message
//         console.log('Creating message with:', { text, imageUrl });
//         const newMessage = await Message.create({
//             sender_id: req.user.id,
//             receiver_id: req.params.id,
//             text: text,
//             img_url: imageUrl
//         });

//         console.log('Message created successfully:', newMessage);
//         res.status(201).json(newMessage);

//     } catch (error) {
//         console.error('Full error details:', {
//             message: error.message,
//             stack: error.stack,
//             receivedData: {
//                 text: req.body.text || req.body.message,
//                 file: req.file ? true : false
//             }
//         });
//         res.status(500).json({
//             error: "Internal server error",
//             details: error.message
//         });
//     }
// };

const sendMessage = async(req, res) => {
    try {
        console.log('Received fields:', req.body);

        // 1. Handle text (ambil dari salah satu field)
        const text = req.body.text || req.body.message || null;

        // 2. Process image upload (jika ada file)
        let imageUrl = null;
        if (req.file) {
            console.log('Received file info:', {
                originalname: req.file.originalname,
                size: req.file.size
            });

            console.log('Uploading image to Cloudinary...');
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ folder: "chat_images" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );

                // Pastikan buffer ada sebelum mengupload
                if (req.file.buffer) {
                    uploadStream.end(req.file.buffer);
                } else {
                    reject(new Error('File buffer is missing'));
                }
            });

            imageUrl = uploadResult.secure_url;
        }

        // Validasi: minimal harus ada text atau image
        if (!text && !imageUrl) {
            return res.status(400).json({
                error: "Bad request",
                message: "Either text or image is required"
            });
        }

        // 3. Create message
        console.log('Creating message with:', { text, imageUrl });
        const newMessage = await Message.create({
            sender_id: req.user.id,
            receiver_id: req.params.id,
            text: text,
            img_url: imageUrl
        });

        console.log('Message created successfully:', newMessage);
        res.status(201).json(newMessage);

    } catch (error) {
        console.error('Full error details:', {
            message: error.message,
            stack: error.stack,
            receivedData: {
                text: req.body.text || req.body.message,
                file: req.file ? true : false
            }
        });
        res.status(500).json({
            error: "Internal server error",
            details: error.message
        });
    }
};


module.exports = { getUsersForSidebar, getMessages, sendMessage, sendMessageWeb };