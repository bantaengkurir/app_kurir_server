// const { Server } = require("socket.io");
// const http = require("http");
// const express = require('express');

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//         origin: ["http://localhost:5173"],
//     },
// });

// // used to store online users
// const userSocketMap = {}; // {userId: socketId}

// function getReceiverSocketId(userId) {
//     return userSocketMap[userId];
// }

// io.on("connection", (socket) => {
//     console.log("A user connected", socket.id);

//     const userId = socket.handshake.query.userId;
//     if (userId) userSocketMap[userId] = socket.id;

//     // io.emit() is used to send events to all the connected clients
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));

//     socket.on("disconnect", () => {
//         console.log("A user disconnected", socket.id);
//         delete userSocketMap[userId];
//         io.emit("getOnlineUsers", Object.keys(userSocketMap));
//     });
// });

// module.exports = { io, app, server, getReceiverSocketId };


// // const { Server } = require("socket.io");
// // const http = require("http");
// // const express = require("express");

// // const app = express();
// // const server = http.createServer(app);

// // const io = new Server(server, {
// //     cors: {
// //         origin: ["http://localhost:5173"], // Sesuaikan dengan URL frontend Anda
// //     },
// // });

// // // Map untuk menyimpan pengguna online
// // const userSocketMap = new Map(); // { userId: socketId }

// // io.on("connection", (socket) => {
// //     console.log("A user connected:", socket.id);

// //     // Ambil userId dari query saat koneksi
// //     const userId = socket.handshake.query.userId;

// //     if (userId) {
// //         userSocketMap.set(userId, socket.id); // Simpan userId dan socketId
// //         console.log(`User ${userId} connected with socket ${socket.id}`);

// //         // Kirim daftar pengguna online ke semua client
// //         io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
// //     }

// //     // Handle disconnect
// //     socket.on("disconnect", () => {
// //         console.log("A user disconnected:", socket.id);

// //         // Cari userId berdasarkan socketId dan hapus
// //         for (const [id, sId] of userSocketMap.entries()) {
// //             if (sId === socket.id) {
// //                 userSocketMap.delete(id);
// //                 console.log(`User ${id} removed from online users`);
// //                 break;
// //             }
// //         }

// //         // Kirim daftar pengguna online terbaru ke semua client
// //         io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
// //     });
// // });

// // module.exports = { io, app, server };

// // File: config/socket.js

// // const onlineCouriers = [];


// // const { User } = require('../models'); // Pastikan model User sudah diimport

// // // Fungsi untuk menambahkan kurir ke daftar online dan memperbarui status di database
// // const addOnlineCourier = async(courierId, socketId, onlineCouriers) => {
// //     // Menyimpan kurir online di Map
// //     onlineCouriers.set(socketId, courierId);

// //     // Memperbarui status kurir ke 'online' di database
// //     try {
// //         await User.update({ status: 'online' }, // Update status menjadi online
// //             { where: { id: courierId } } // Mencari berdasarkan courierId
// //         );
// //         console.log(`Courier ${courierId} is now online in the database`);
// //     } catch (error) {
// //         console.error("Error updating status to online:", error);
// //     }
// // };

// // // Fungsi untuk menghapus kurir dari daftar online dan memperbarui status di database
// // const removeOnlineCourier = async(socketId, onlineCouriers) => {
// //     const courierId = onlineCouriers.get(socketId);
// //     if (courierId) {
// //         onlineCouriers.delete(socketId);

// //         // Memperbarui status kurir ke 'offline' di database
// //         try {
// //             await User.update({ status: 'offline' }, // Update status menjadi offline
// //                 { where: { id: courierId } } // Mencari berdasarkan courierId
// //             );
// //             console.log(`Courier ${courierId} is now offline in the database`);
// //         } catch (error) {
// //             console.error("Error updating status to offline:", error);
// //         }
// //     }
// // };

// // const getOnlineCouriers = () => {
// //     return Array.from(onlineCouriers.values()); // Mengembalikan array dari courierId yang online
// // };

// // module.exports = { addOnlineCourier, removeOnlineCourier, getOnlineCouriers };











// const onlineUsers = new Map();
// const { User } = require('../models');

// const addOnlineUser = async(userId, socketId) => {
//     try {
//         // Menyimpan kurir online di Map
//         onlineUsers.set(socketId, userId);

//         // Memperbarui status kurir ke 'online' di database
//         const result = await User.update({ status: 'online' }, { where: { id: userId } });

//         if (result[0] > 0) {
//             console.log(`user ${userId} status updated to online in the database.`);
//         } else {
//             console.log(`user ${userId} status update failed.`);
//         }
//     } catch (error) {
//         console.error("Error updating user status to online:", error);
//     }
// };


// // Fungsi untuk menghapus kurir dari daftar online dan memperbarui status di database
// const removeOnlineUser = async(socketId) => {
//     const userId = onlineUsers.get(socketId);
//     if (userId) {
//         onlineUsers.delete(socketId);

//         // Memperbarui status kurir ke 'offline' di database
//         try {
//             await User.update({ status: 'offline' }, { where: { id: userId } });
//             console.log(`user ${userId} is now offline in the database`);
//         } catch (error) {
//             console.error("Error updating status to offline:", error);
//         }
//     }
// };

// // Mendapatkan daftar kurir yang sedang online
// const getOnlineUsers = () => {
//     return Array.from(onlineusers.values());
// };

// module.exports = { addOnlineUser, removeOnlineUser, getOnlineUsers };


// const { Server } = require("socket.io");
// const http = require("http");
// const express = require("express");
// const { user: UserModel } = require("../models");

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:5173",
//         methods: ["GET", "POST"],
//         credentials: true, // Izinkan pengiriman cookies/session
//     },
// });


// // Menyimpan pengguna online
// const onlineUsers = new Map(); // { socketId: userId }

// io.on("connection", (socket) => {
//     console.log("A user connected", socket.id);

//     const userId = socket.handshake.query.userId;
//     if (userId) {
//         onlineUsers.set(socket.id, userId);
//         updateUserStatus(userId, "online");
//     }

//     io.emit("getOnlineUsers", Array.from(onlineUsers.values()));

//     socket.on("disconnect", () => {
//         const userId = onlineUsers.get(socket.id);
//         if (userId) {
//             onlineUsers.delete(socket.id);
//             updateUserStatus(userId, "offline");
//         }
//         io.emit("getOnlineUsers", Array.from(onlineUsers.values()));
//         console.log("A user disconnected", socket.id);
//     });
// });

// const updateUserStatus = async(userId, status) => {
//     try {
//         await UserModel.update({ status }, { where: { id: userId } });
//         console.log(`User ${userId} is now ${status}`);
//     } catch (error) {
//         console.error(`Error updating user ${userId} status to ${status}:`, error);
//     }
// };

// const getOnlineUsers = () => {
//     return Array.from(onlineUsers.values());
// };

// const getReceiverSocketId = (receiverId) => {
//     const onlineUserEntry = [...onlineUsers.entries()].find(([socketId, userId]) => userId === receiverId);
//     return onlineUserEntry ? onlineUserEntry[0] : null;
// };

// module.exports = { io, app, server, getOnlineUsers, getReceiverSocketId };


// const { Server } = require("socket.io");
// const http = require("http");
// const express = require('express');

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//         origin: ["http://localhost:5173"],
//     },
// });

// // used to store online users
// const userSocketMap = {}; // {userId: socketId}

// function getReceiverSocketId(userId) {
//     return userSocketMap[userId];
// }

// // Function to get online users
// function getOnlineUsers() {
//     return Object.keys(userSocketMap); // Return an array of userIds
// }

// io.on("connection", (socket) => {
//     console.log("A user connected", socket.id);

//     const userId = socket.handshake.query.userId;
//     if (userId) userSocketMap[userId] = socket.id;

//     // io.emit() is used to send events to all the connected clients
//     io.emit("getOnlineUsers", getOnlineUsers());

//     socket.on("disconnect", () => {
//         console.log("A user disconnected", socket.id);
//         delete userSocketMap[userId];
//         io.emit("getOnlineUsers", getOnlineUsers());
//     });
// });

// module.exports = { io, app, server, getReceiverSocketId, getOnlineUsers }; // Export getOnlineUsers


const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const { user: UserModel } = require("../models"); // Import model User dari Sequelize

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    },
});

// used to store online users
const userSocketMap = {}; // {userId: socketId}

function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

// Function to get online users
function getOnlineUsers() {
    return Object.keys(userSocketMap); // Return an array of userIds
}

io.on("connection", async(socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;

        // Update status user menjadi "online" di database
        try {
            await UserModel.update({ status: "online" }, // Set status menjadi "online"
                { where: { id: userId } } // Filter berdasarkan userId
            );
            console.log(`User ${userId} is now online`);
        } catch (error) {
            console.error("Error updating user status to online:", error);
        }
    }

    // Kirim daftar pengguna online ke semua klien
    io.emit("getOnlineUsers", getOnlineUsers());

    socket.on("disconnect", async() => {
        console.log("A user disconnected", socket.id);

        if (userId) {
            delete userSocketMap[userId];

            // Update status user menjadi "offline" di database
            try {
                await UserModel.update({ status: "offline" }, // Set status menjadi "offline"
                    { where: { id: userId } } // Filter berdasarkan userId
                );
                console.log(`User ${userId} is now offline`);
            } catch (error) {
                console.error("Error updating user status to offline:", error);
            }
        }

        // Kirim daftar pengguna online yang diperbarui ke semua klien
        io.emit("getOnlineUsers", getOnlineUsers());
    });
});

module.exports = { io, app, server, getReceiverSocketId, getOnlineUsers };