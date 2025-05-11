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
const { user: UserModel } = require("../models");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true,
        transports: ['websocket', 'polling']
    },
});

const userSocketMap = {};

function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

function getOnlineUsers() {
    return Object.keys(userSocketMap);
}

const activeCalls = {};

io.on("connection", async(socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;

        try {
            // Update status ke online
            await UserModel.update({ status: "online" }, { where: { id: userId } });
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
                }, 15000); // Update setiap 30 detik

                // Simpan interval di socket
                socket.locationInterval = locationInterval;
            }
        } catch (error) {
            console.error("Error updating user status to online:", error);
        }
    }

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

    // Kirim daftar pengguna online
    io.emit("getOnlineUsers", getOnlineUsers());

    socket.on("disconnect", async() => {
        console.log("A user disconnected", socket.id);

        if (userId) {
            delete userSocketMap[userId];

            try {
                await UserModel.update({ status: "offline" }, { where: { id: userId } });
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