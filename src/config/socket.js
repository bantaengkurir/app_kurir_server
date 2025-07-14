// const { Server } = require("socket.io");
// const http = require("http");
// const express = require("express");
// const { user: UserModel } = require("../models");

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//         origin: ["http://localhost:5173"],
//         credentials: true,
//         transports: ['websocket', 'polling']
//     },
// });

// const userSocketMap = {};

// function getReceiverSocketId(userId) {
//     return userSocketMap[userId];
// }

// function getOnlineUsers() {
//     return Object.keys(userSocketMap);
// }

// io.on("connection", async(socket) => {
//     console.log("A user connected", socket.id);

//     const userId = socket.handshake.query.userId;
//     if (userId) {
//         userSocketMap[userId] = socket.id;

//         try {
//             // Update status ke online
//             await UserModel.update({ status: "online" }, { where: { id: userId } });
//             console.log(`User ${userId} is now online`);

//             // Cek apakah user adalah courier
//             const user = await UserModel.findByPk(userId);
//             if (user && user.role === "courier") {
//                 // Minta lokasi ke client jika data lokasi masih kosong
//                 if (!user.address || !user.latitude || !user.longitude) {
//                     socket.emit("requestLocation");
//                 }

//                 // Setup interval untuk update lokasi berkala
//                 const locationInterval = setInterval(async() => {
//                     const updatedUser = await UserModel.findByPk(userId);
//                     if (updatedUser && updatedUser.role === "courier") {
//                         socket.emit("requestLocationUpdate");
//                     }
//                 }, 15000); // Update setiap 30 detik

//                 // Simpan interval di socket
//                 socket.locationInterval = locationInterval;
//             }
//         } catch (error) {
//             console.error("Error updating user status to online:", error);
//         }
//     }

//     // // Handle inisiasi panggilan
//     // socket.on('initiate-call', ({ orderId, callerId, receiverId }) => {
//     //     const receiverSocketId = userSocketMap[receiverId];
//     //     if (receiverSocketId) {
//     //         io.to(receiverSocketId).emit('incoming-call', {
//     //             orderId,
//     //             callerId
//     //         });
//     //     }
//     // });

//     // server.js
//     io.on('connection', (socket) => {
//         // Simpan mapping userID -> socketID
//         const userId = socket.handshake.query.userId;
//         userSocketMap[userId] = socket.id;

//         // Handle panggilan masuk
//         socket.on('initiate-call', ({ callerId, orderId }) => {
//             const receiverSocketId = userSocketMap[callerId];

//             if (receiverSocketId) {
//                 io.to(receiverSocketId).emit('incoming-call', {
//                     callerId,
//                     orderId,
//                     timestamp: new Date()
//                 });
//             }
//         });

//         // Handle penerimaan panggilan
//         socket.on('accept-call', ({ orderId }) => {
//             socket.join(`call-room:${orderId}`);
//             io.to(`call-room:${orderId}`).emit('call-accepted');
//         });
//     });

//     // Terima data lokasi dari client
//     socket.on("updateLocation", async(locationData) => {
//         try {
//             if (!userId) return;

//             const user = await UserModel.findByPk(userId);
//             if (!user || user.role !== "courier") return;

//             // Update lokasi di database
//             await UserModel.update({
//                 address: locationData.address,
//                 latitude: locationData.latitude,
//                 longitude: locationData.longitude,
//                 last_location_update: new Date()
//             }, { where: { id: userId } });

//             console.log(`Lokasi courier ${userId} diperbarui`);

//             // Broadcast ke semua client yang perlu tahu
//             io.emit("courierLocationUpdated", {
//                 userId,
//                 ...locationData,
//                 timestamp: new Date()
//             });

//         } catch (error) {
//             console.error("Gagal update lokasi courier:", error);
//         }
//     });

//     // Kirim daftar pengguna online
//     io.emit("getOnlineUsers", getOnlineUsers());

//     socket.on("disconnect", async() => {
//         console.log("A user disconnected", socket.id);

//         if (userId) {
//             delete userSocketMap[userId];

//             try {
//                 await UserModel.update({ status: "offline" }, { where: { id: userId } });
//                 console.log(`User ${userId} is now offline`);

//                 // Hentikan interval lokasi jika user adalah courier
//                 if (socket.locationInterval) {
//                     clearInterval(socket.locationInterval);
//                 }
//             } catch (error) {
//                 console.error("Error updating user status to offline:", error);
//             }
//         }

//         io.emit("getOnlineUsers", getOnlineUsers());
//     });
// });

// module.exports = { io, app, server, getReceiverSocketId, getOnlineUsers };


const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const { user: UserModel, message: MessageModel } = require("../models");
const { Op } = require("sequelize");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "https://bantaeng-dessert.vercel.app"],
        credentials: true,
        transports: ['websocket', 'polling']
    },
});

const userSocketMap = {};
const onlineUsers = new Map(); // Map<userId, socketId>


// function getReceiverSocketId(userId) {
//     return userSocketMap[userId];
// }

// !diperbaiki 
// function getReceiverSocketId(userId) {
//     // Jika menyimpan array (multiple devices)
//     if (Array.isArray(userSocketMap[userId])) {
//         return userSocketMap[userId][0]; // Ambil socket pertama
//     }
//     return userSocketMap[userId]; // Untuk single socket

function getReceiverSocketId(userId) {
    if (!userSocketMap[userId]) return null;

    // Kembalikan SEMUA socket ID
    return Array.isArray(userSocketMap[userId]) ?
        userSocketMap[userId] : [userSocketMap[userId]];
}
// }
//! disini

function getOnlineUsers() {
    return Object.keys(userSocketMap);
}

const activeCalls = {};

io.on("connection", async(socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
        //! ini pembaruan

        if (!userSocketMap[userId]) {
            userSocketMap[userId] = [];
        }



        // Tambahkan socket ID ke array
        userSocketMap[userId].push(socket.id);


        // if (!userSocketMap[userId]) {
        //     userSocketMap[userId] = [];
        // }
        // userSocketMap[userId].push(socket.id);


        //! disini
        // userSocketMap[userId] = socket.id;


        try {
            // Update status ke online
            await UserModel.update({ status: "online" }, { where: { id: userId } });
            io.emit("user-status-changed", { userId, status: "online" });
            console.log(`User ${userId} is now online`);

            // Cek apakah user adalah courier
            const user = await UserModel.findByPk(userId);
            if (user && user.role === "courier") {
                // Minta lokasi ke client jika data lokasi masih kosong
                if (!user.address || !user.latitude || !user.longitude) {
                    socket.emit("requestLocation");
                }

                // Setup interval untuk update lokasi berkala
                const locationInterval = setInterval(async() => {
                    const updatedUser = await UserModel.findByPk(userId);
                    if (updatedUser && updatedUser.role === "courier") {
                        socket.emit("requestLocationUpdate");
                    }
                }, 30000); // Update setiap 30 detik

                // Simpan interval di socket
                socket.locationInterval = locationInterval;
            }
        } catch (error) {
            console.error("Error updating user status to online:", error);
        }
    }

    // ! ini langsung tanpa axios di usechat store
    socket.on("getMessages", async({ userId, otherUserId }) => {
        try {
            const messages = await MessageModel.findAll({
                where: {
                    [Op.or]: [
                        { sender_id: userId, receiver_id: otherUserId },
                        { sender_id: otherUserId, receiver_id: userId },
                    ],
                },
                order: [
                    ["createdAt", "ASC"]
                ],
            });

            socket.emit("chatHistory", messages);
        } catch (error) {
            console.error("Error getting messages:", error);
        }
    });

    // ! ini perbaikan 1 salah posisi
    // socket.on("sendMessage", async(data) => {
    //     try {
    //         const { text, img_url, receiver_id } = data;
    //         const sender_id = userId; // userId dari socket.handshake.query.userId
    // console.log("ssssssssssssssssender id")

    //         // Simpan ke DB
    //         const newMessage = await MessageModel.create({
    //             sender_id: userId,
    //             receiver_id,
    //             text,
    //             img_url,
    //         });

    //         console.log("iiiiiiiiiiiiiiiiini", newMessage)


    //         // KIRIM KE SEMUA SOCKET PENERIMA (perbaikan utama)
    //         const receiverSocketIds = getReceiverSocketId(receiver_id);
    //         if (receiverSocketIds) {
    //             const ids = Array.isArray(receiverSocketIds) ?
    //                 receiverSocketIds : [receiverSocketIds];

    //             ids.forEach(socketId => {
    //                 io.to(socketId).emit("newMessage", newMessage);
    //             });
    //         }

    //         // KIRIM KE SEMUA SOCKET PENGIRIM
    //         const senderSocketIds = getReceiverSocketId(userId);
    //         if (senderSocketIds) {
    //             const ids = Array.isArray(senderSocketIds) ?
    //                 senderSocketIds : [senderSocketIds];

    //             ids.forEach(socketId => {
    //                 io.to(socketId).emit("newMessage", newMessage);
    //             });
    //         }

    //         console.log("📤 Sent to all receiver sockets:", ids);

    //         // // Kirim ke receiver
    //         // const receiverSocketId = getReceiverSocketId(receiver_id);
    //         // if (receiverSocketId) {
    //         //     io.to(receiverSocketId).emit("newMessage", newMessage);
    //         // }

    //         // console.log("📤 Emit to receiver:", receiver_id, "=>", receiverSocketId);


    //         // // Kirim juga ke sender untuk update UI
    //         // socket.emit("newMessage", newMessage);

    //     } catch (error) {
    //         console.error("Error handling sendMessage via socket:", error);
    //     }
    // });


    // ! ini perbaikan
    socket.on("sendMessage", async(data) => {
        try {
            const { text, img_url, receiver_id } = data;
            const sender_id = socket.handshake.query.userId;

            // Pastikan format data konsisten
            const messageData = {
                sender_id: parseInt(sender_id),
                receiver_id: parseInt(receiver_id),
                text,
                img_url,
                createdAt: new Date() // Tambahkan timestamp
            };

            // Simpan ke DB
            const newMessage = await MessageModel.create(messageData);

            // Format response konsisten
            const responseMessage = {
                id: newMessage.id,
                sender_id: newMessage.sender_id,
                receiver_id: newMessage.receiver_id,
                text: newMessage.text,
                img_url: newMessage.img_url,
                createdAt: newMessage.createdAt
            };

            // Kirim ke semua socket penerima
            const receiverSockets = getReceiverSocketId(receiver_id);
            if (receiverSockets) {
                receiverSockets.forEach(socketId => {
                    io.to(socketId).emit("newMessage", responseMessage);
                });
            }

            // Kirim ke semua socket pengirim (untuk update UI)
            const senderSockets = getReceiverSocketId(sender_id);
            if (senderSockets) {
                senderSockets.forEach(socketId => {
                    io.to(socketId).emit("newMessage", responseMessage);
                });
            }

        } catch (error) {
            console.error("Error handling sendMessage:", error);
        }
    });


    //! ini yang berfungsi sebelumnya diubah
    // const getConversation = async(currentUserId) => {
    //     const messages = await MessageModel.findAll({
    //         where: {
    //             [Op.or]: [
    //                 { sender_id: currentUserId },
    //                 { receiver_id: currentUserId }
    //             ]
    //         },
    //         include: [
    //             { model: User, as: 'sender', attributes: ['id', 'name', 'profile_pic'] },
    //             { model: User, as: 'receiver', attributes: ['id', 'name', 'profile_pic'] }
    //         ],
    //         order: [
    //             ['created_at', 'DESC']
    //         ],
    //         limit: 1000
    //     });

    //     const partnerMap = new Map();

    //     messages.forEach((message) => {
    //         const partnerId =
    //             message.sender_id === currentUserId ?
    //             message.receiver_id :
    //             message.sender_id;

    //         if (!partnerMap.has(partnerId)) {
    //             partnerMap.set(partnerId, {
    //                 partner: message.sender_id === currentUserId ?
    //                     message.receiver : message.sender,
    //                 lastMessage: message,
    //                 unreadCount: 0
    //             });
    //         }

    //         // Hitung pesan belum dibaca
    //         if (
    //             message.sender_id === partnerId &&
    //             !message.is_read
    //         ) {
    //             partnerMap.get(partnerId).unreadCount++;
    //         }
    //     });

    //     return Array.from(partnerMap.values()).map((conv) => ({
    //         _id: conv.partner.id,
    //         lastMessage: conv.lastMessage,
    //         unreadCount: conv.unreadCount,
    //         partner: conv.partner
    //     }));
    // };


    // ! ini perbaikan
    // [Fungsi getConversation - sudah dimodifikasi untuk Sequelize]
    const getConversation = async(currentUserId) => {
        try {
            const messages = await MessageModel.findAll({
                where: {
                    [Op.or]: [
                        { sender_id: currentUserId },
                        { receiver_id: currentUserId }
                    ]
                },
                include: [{
                        model: UserModel,
                        as: 'sender',
                        attributes: ['id', 'name', 'profile_image']
                    },
                    {
                        model: UserModel,
                        as: 'receiver',
                        attributes: ['id', 'name', 'profile_image']
                    }
                ],
                order: [
                    ['created_at', 'DESC']
                ],
                limit: 1000
            });


            const partnerMap = new Map();

            messages.forEach((message) => {
                const partnerId = message.sender_id === parseInt(currentUserId) ?
                    message.receiver_id :
                    message.sender_id;

                // console.log("ssssssssssssssender id", message.sender_id)
                // console.log("rrrrrrrrrrrrrrrreceiver id", message.receiver_id)
                // console.log("ppppppppppppppppppppppartner map", partnerMap)
                // console.log("mmmmmmmmmmmmmmmmmmmmmm read", message.is_read)

                if (!partnerMap.has(partnerId)) {
                    partnerMap.set(partnerId, {
                        partner: message.sender_id === parseInt(currentUserId) ?
                            message.receiver : message.sender,
                        lastMessage: message,
                        unreadCount: 0
                    });
                }

                // Hitung pesan belum dibaca
                if (message.sender_id === partnerId && !message.is_read) {
                    partnerMap.get(partnerId).unreadCount++;
                }
            });

            return Array.from(partnerMap.values()).map((conv) => ({
                id: conv.partner.id.toString(), // KONVERSI KE STRING
                lastMessage: conv.lastMessage,
                unreadCount: conv.unreadCount,
                partner: conv.partner
            }));
        } catch (error) {
            console.error('Error getting conversation:', error);
            return [];
        }
    };

    // [Event Handler untuk Seen Status]
    socket.on('seen', async(msgByUserId) => {
        try {
            const currentUserId = socket.handshake.query.userId;

            if (!currentUserId || !msgByUserId) {
                console.log('Missing user IDs in seen event');
                return;
            }

            // 1. Update semua pesan yang belum dibaca dari pengirim tertentu
            await MessageModel.update({ is_read: true }, {
                where: {
                    sender_id: msgByUserId,
                    receiver_id: currentUserId,
                    // is_read: false
                }
            });

            // 2. Dapatkan percakapan terbaru untuk kedua belah pihak
            const conversationSender = await getConversation(currentUserId);

            const conversationReceiver = await getConversation(msgByUserId);



            // Normalisasi ID sebelum mengirim

            // 3. Kirim pembaruan ke semua perangkat pengguna
            const senderSockets = getReceiverSocketId(currentUserId);
            if (senderSockets) {
                senderSockets.forEach(socketId => {
                    io.to(socketId).emit('conversation', conversationSender);
                });
            }

            const receiverSockets = getReceiverSocketId(msgByUserId);
            if (receiverSockets) {
                receiverSockets.forEach(socketId => {
                    io.to(socketId).emit('conversation', conversationReceiver);
                });
            }



            const normalizeConversation = (conv) => ({
                ...conv,
                id: conv.id.toString()
            });

            senderSockets.forEach(socketId => {
                io.to(socketId).emit('conversation',
                    conversationSender.map(normalizeConversation)
                );
            });



            receiverSockets.forEach(socketId => {
                io.to(socketId).emit('conversation',
                    conversationReceiver.map(normalizeConversation)
                );
            });

            // console.log("cccccccccccccccconversationsender", conversationSender)
            // console.log("cccccccccccccccconversationreceiver", conversationReceiver)

            // 3. Kirim pembaruan ke semua perangkat pengguna
            // const senderSockets = getReceiverSocketId(currentUserId);
            // if (senderSockets) {
            //     senderSockets.forEach(socketId => {
            //         io.to(socketId).emit('conversation', conversationSender);
            //     });
            // }

            // const receiverSockets = getReceiverSocketId(msgByUserId);
            // if (receiverSockets) {
            //     receiverSockets.forEach(socketId => {
            //         io.to(socketId).emit('conversation', conversationReceiver);
            //     });
            // }

            // console.log("rrrrrrrrrrrrrrrreceiver socket", receiverSockets)

            // console.log(`Pesan dari ${msgByUserId} ditandai sudah dibaca oleh ${currentUserId}`);

        } catch (error) {
            console.error('Error in seen event:', error);
            // Kirim notifikasi error ke client
            socket.emit('conversation-error', error.message);
        }
    });


    // [BARU] Kirim ulang history chat jika ada di local storage client
    socket.on("requestChatHistory", async({ userId, otherUserId }) => {
        try {
            // Cek di database
            const messages = await MessageModel.findAll({
                where: {
                    [Op.or]: [
                        { sender_id: userId, receiver_id: otherUserId },
                        { sender_id: otherUserId, receiver_id: userId },
                    ],
                },
                order: [
                    ["createdAt", "ASC"]
                ],
            });

            // Kirim ke client
            socket.emit("chatHistory", messages);
        } catch (error) {
            console.error("Error getting messages:", error);
        }
    });



    // // Handle inisiasi panggilan
    // socket.on('initiate-call', ({ orderId, callerId, receiverId }) => {
    //     const receiverSocketId = userSocketMap[receiverId];
    //     if (receiverSocketId) {
    //         io.to(receiverSocketId).emit('incoming-call', {
    //             orderId,
    //             callerId
    //         });
    //     }
    // });

    // [1] Handler Inisiasi Panggilan
    // Di backend (socket.js)
    socket.on('initiate-call', async({ callerId, orderId, receiverId }) => {
        try {
            // Validasi parameter
            if (!callerId || !orderId || !receiverId) {
                throw new Error('Missing call parameters');
            }

            console.log(`Call from ${callerId} to ${receiverId} for order ${orderId}`);

            const receiverSocketId = userSocketMap[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('incoming-call', {
                    callerId,
                    orderId,
                    timestamp: new Date()
                });
            } else {
                io.to(socket.id).emit('call-failed', {
                    reason: 'Penerima tidak online'
                });
            }
        } catch (error) {
            console.error('Call initiation error:', error);
        }
    });

    // [2] Handler Penerimaan Panggilan
    socket.on('accept-call', ({ orderId }) => {
        const call = activeCalls[orderId];
        if (!call) return;

        call.status = 'accepted';
        const callerSocketId = userSocketMap[call.callerId];

        // Buat room panggilan
        socket.join(`call-room:${orderId}`);
        if (callerSocketId) {
            io.to(callerSocketId).emit('call-accepted', { orderId });
            io.to(`call-room:${orderId}`).emit('call-started');
        }
    });

    // [3] Handler Penolakan Panggilan
    socket.on('reject-call', ({ orderId }) => {
        const call = activeCalls[orderId];
        if (!call) return;

        const callerSocketId = userSocketMap[call.callerId];
        if (callerSocketId) {
            io.to(callerSocketId).emit('call-rejected', { orderId });
        }
        delete activeCalls[orderId];
    });

    // [4] Handler Akhir Panggilan
    socket.on('end-call', ({ orderId }) => {
        const call = activeCalls[orderId];
        if (!call) return;

        io.to(`call-room:${orderId}`).emit('call-ended');
        delete activeCalls[orderId];
    });

    // Terima data lokasi dari client
    socket.on("updateLocation", async(locationData) => {
        try {
            if (!userId) return;

            const user = await UserModel.findByPk(userId);
            if (!user || user.role !== "courier") return;

            // Update lokasi di database
            await UserModel.update({
                address: locationData.address,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                last_location_update: new Date()
            }, { where: { id: userId } });

            console.log(`Lokasi courier ${userId} diperbarui`);

            // Broadcast ke semua client yang perlu tahu
            io.emit("courierLocationUpdated", {
                userId,
                ...locationData,
                timestamp: new Date()
            });

        } catch (error) {
            console.error("Gagal update lokasi courier:", error);
        }
    });




    // Di dalam connection handler
    socket.on("typing", (data) => {
        const receiverSocketId = getReceiverSocketId(data.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing", {
                senderId: socket.userId,
                isTyping: true
            });
        }
    });

    socket.on("stopTyping", (data) => {
        const receiverSocketId = getReceiverSocketId(data.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing", {
                senderId: socket.userId,
                isTyping: false
            });
        }
    });

    // Kirim daftar pengguna online
    io.emit("getOnlineUsers", getOnlineUsers());

    socket.on("disconnect", async() => {
        console.log("A user disconnected", socket.id);

        if (userId) {
            // delete userSocketMap[userId];
            if (userSocketMap[userId]) {
                userSocketMap[userId] = userSocketMap[userId].filter(
                    id => id !== socket.id
                );

                // Hapus key jika array kosong
                if (userSocketMap[userId].length === 0) {
                    delete userSocketMap[userId];
                }
            }

            try {
                await UserModel.update({ status: "offline" }, { where: { id: userId } });
                io.emit("user-status-changed", { userId, status: "offline" });
                console.log(`User ${userId} is now offline`);

                // Hentikan interval lokasi jika user adalah courier
                if (socket.locationInterval) {
                    clearInterval(socket.locationInterval);
                }
            } catch (error) {
                console.error("Error updating user status to offline:", error);
            }
        }

        io.emit("getOnlineUsers", getOnlineUsers());
    });
});

module.exports = { io, app, server, getReceiverSocketId, getOnlineUsers };





// ! yang diperbaiki karena setelah direfresh data messagesnya hilang