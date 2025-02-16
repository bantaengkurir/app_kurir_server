// const { Server } = require("socket.io");
// const http = require("http");
// const express = require("express");
// const { user: UserModel } = require("../models"); // Import model User dari Sequelize

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//         origin: ["http://localhost:5173"],
//         credentials: true,
//         transports: ['websocket', 'polling'] // Tambahkan opsi transports
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

// io.on("connection", async(socket) => {
//     console.log("A user connected", socket.id);

//     const userId = socket.handshake.query.userId;
//     if (userId) {
//         userSocketMap[userId] = socket.id;

//         // Update status user menjadi "online" di database
//         try {
//             await UserModel.update({ status: "online" }, // Set status menjadi "online"
//                 { where: { id: userId } } // Filter berdasarkan userId
//             );
//             console.log(`User ${userId} is now online`);
//         } catch (error) {
//             console.error("Error updating user status to online:", error);
//         }
//     }

//     // Kirim daftar pengguna online ke semua klien
//     io.emit("getOnlineUsers", getOnlineUsers());

//     socket.on("disconnect", async() => {
//         console.log("A user disconnected", socket.id);

//         if (userId) {
//             delete userSocketMap[userId];

//             // Update status user menjadi "offline" di database
//             try {
//                 await UserModel.update({ status: "offline" }, // Set status menjadi "offline"
//                     { where: { id: userId } } // Filter berdasarkan userId
//                 );
//                 console.log(`User ${userId} is now offline`);
//             } catch (error) {
//                 console.error("Error updating user status to offline:", error);
//             }
//         }

//         // Kirim daftar pengguna online yang diperbarui ke semua klien
//         io.emit("getOnlineUsers", getOnlineUsers());
//     });
// });

// module.exports = { io, app, server, getReceiverSocketId, getOnlineUsers };


// // const { Server } = require("socket.io");
// // const http = require("http");
// // const express = require("express");
// // const { user: UserModel } = require("../models"); // Import model User dari Sequelize

// // const app = express();
// // const server = http.createServer(app);

// // const io = new Server(server, {
// //     cors: {
// //         origin: ["http://localhost:5173"],
// //     },
// // });

// // // Simpan informasi pengguna online
// // const userSocketMap = {}; // {userId: socketId}

// // // Simpan informasi order yang sedang aktif
// // const orderSocketMap = {}; // {orderId: { courierId, customerId }}

// // // Simpan informasi kurir yang sedang online
// // const courierSocketMap = {}; // {courierId: socketId}

// // // Function to get receiver socket ID
// // function getReceiverSocketId(userId) {
// //     return userSocketMap[userId];
// // }

// // // Function to get online users
// // function getOnlineUsers() {
// //     return Object.keys(userSocketMap); // Return an array of userIds
// // }

// // // Function to get active orders
// // function getActiveOrders() {
// //     return Object.keys(orderSocketMap); // Return an array of orderIds
// // }

// // // Function to get online couriers
// // function getOnlineCouriers() {
// //     return Object.keys(courierSocketMap); // Return an array of courierIds
// // }

// // io.on("connection", async(socket) => {
// //     console.log("A user connected", socket.id);

// //     const userId = socket.handshake.query.userId;
// //     const userRole = socket.handshake.query.role; // 'customer' atau 'courier'
// //     const orderId = socket.handshake.query.orderId; // Order ID (jika ada)

// //     if (userId) {
// //         userSocketMap[userId] = socket.id;

// //         // Update status user menjadi "online" di database
// //         try {
// //             await UserModel.update({ status: "online" }, // Set status menjadi "online"
// //                 { where: { id: userId } } // Filter berdasarkan userId
// //             );
// //             console.log(`User ${userId} is now online`);
// //         } catch (error) {
// //             console.error("Error updating user status to online:", error);
// //         }

// //         // Jika pengguna adalah kurir, simpan ke courierSocketMap
// //         if (userRole === "courier") {
// //             courierSocketMap[userId] = socket.id;
// //             console.log(`Courier ${userId} is now online`);
// //         }

// //         // Jika ada orderId, simpan ke orderSocketMap
// //         if (orderId) {
// //             orderSocketMap[orderId] = {
// //                 courierId: userRole === "courier" ? userId : null,
// //                 customerId: userRole === "customer" ? userId : null,
// //             };
// //             console.log(`Order ${orderId} is now active`);
// //         }
// //     }

// //     // Handle update lokasi kurir
// //     socket.on("updateLocation", (data) => {
// //         const { orderId, latitude, longitude } = data;

// //         // Kirim update lokasi ke customer yang terkait dengan order tersebut
// //         if (orderSocketMap[orderId]) {
// //             const customerId = orderSocketMap[orderId].customerId;
// //             const customerSocketId = userSocketMap[customerId];

// //             if (customerSocketId) {
// //                 io.to(customerSocketId).emit("locationUpdated", {
// //                     orderId,
// //                     latitude,
// //                     longitude,
// //                 });
// //                 console.log(`Location updated for order ${orderId}`);
// //             }
// //         }
// //     });

// //     // Handle disconnect
// //     socket.on("disconnect", async() => {
// //         console.log("A user disconnected", socket.id);

// //         if (userId) {
// //             delete userSocketMap[userId];

// //             // Update status user menjadi "offline" di database
// //             try {
// //                 await UserModel.update({ status: "offline" }, // Set status menjadi "offline"
// //                     { where: { id: userId } } // Filter berdasarkan userId
// //                 );
// //                 console.log(`User ${userId} is now offline`);
// //             } catch (error) {
// //                 console.error("Error updating user status to offline:", error);
// //             }

// //             // Jika pengguna adalah kurir, hapus dari courierSocketMap
// //             if (userRole === "courier") {
// //                 delete courierSocketMap[userId];
// //                 console.log(`Courier ${userId} is now offline`);
// //             }

// //             // Jika ada orderId, hapus dari orderSocketMap
// //             if (orderId) {
// //                 delete orderSocketMap[orderId];
// //                 console.log(`Order ${orderId} is no longer active`);
// //             }
// //         }

// //         // Kirim daftar pengguna online yang diperbarui ke semua klien
// //         io.emit("getOnlineUsers", getOnlineUsers());

// //         // Kirim daftar kurir online yang diperbarui ke semua klien
// //         io.emit("getOnlineCouriers", getOnlineCouriers());

// //         // Kirim daftar order aktif yang diperbarui ke semua klien
// //         io.emit("getActiveOrders", getActiveOrders());
// //     });
// // });

// // // io.on("connection", async(socket) => {
// // //     console.log("A user connected", socket.id);

// // //     const userId = socket.handshake.query.userId;
// // //     const userRole = socket.handshake.query.role; // 'customer' atau 'courier'
// // //     const orderId = socket.handshake.query.orderId; // Order ID (jika ada)

// // //     if (userId) {
// // //         userSocketMap[userId] = socket.id;

// // //         // Update status user menjadi "online" di database
// // //         try {
// // //             await UserModel.update({ status: "online" }, // Set status menjadi "online"
// // //                 { where: { id: userId } } // Filter berdasarkan userId
// // //             );
// // //             console.log(`User ${userId} is now online`);
// // //         } catch (error) {
// // //             console.error("Error updating user status to online:", error);
// // //         }

// // //         // Jika pengguna adalah kurir, simpan ke courierSocketMap
// // //         if (userRole === "courier") {
// // //             courierSocketMap[userId] = socket.id;
// // //             console.log(`Courier ${userId} is now online`);
// // //         }

// // //         // Jika ada orderId, simpan ke orderSocketMap
// // //         if (orderId) {
// // //             orderSocketMap[orderId] = {
// // //                 courierId: userRole === "courier" ? userId : null,
// // //                 customerId: userRole === "customer" ? userId : null,
// // //             };
// // //             console.log(`Order ${orderId} is now active`);
// // //         }
// // //     }

// // //     // Kirim daftar pengguna online ke semua klien
// // //     io.emit("getOnlineUsers", getOnlineUsers());

// // //     // Kirim daftar kurir online ke semua klien
// // //     io.emit("getOnlineCouriers", getOnlineCouriers());

// // //     // Kirim daftar order aktif ke semua klien
// // //     io.emit("getActiveOrders", getActiveOrders());

// // //     // Handle update lokasi kurir
// // //     socket.on("updateLocation", (data) => {
// // //         const { orderId, latitude, longitude } = data;

// // //         // Kirim update lokasi ke customer yang terkait dengan order tersebut
// // //         if (orderSocketMap[orderId]) {
// // //             const customerId = orderSocketMap[orderId].customerId;
// // //             const customerSocketId = userSocketMap[customerId];

// // //             if (customerSocketId) {
// // //                 io.to(customerSocketId).emit("locationUpdated", {
// // //                     orderId,
// // //                     latitude,
// // //                     longitude,
// // //                 });
// // //                 console.log(`Location updated for order ${orderId}`);
// // //             }
// // //         }
// // //     });

// // //     // Handle disconnect
// // //     socket.on("disconnect", async() => {
// // //         console.log("A user disconnected", socket.id);

// // //         if (userId) {
// // //             delete userSocketMap[userId];

// // //             // Update status user menjadi "offline" di database
// // //             try {
// // //                 await UserModel.update({ status: "offline" }, // Set status menjadi "offline"
// // //                     { where: { id: userId } } // Filter berdasarkan userId
// // //                 );
// // //                 console.log(`User ${userId} is now offline`);
// // //             } catch (error) {
// // //                 console.error("Error updating user status to offline:", error);
// // //             }

// // //             // Jika pengguna adalah kurir, hapus dari courierSocketMap
// // //             if (userRole === "courier") {
// // //                 delete courierSocketMap[userId];
// // //                 console.log(`Courier ${userId} is now offline`);
// // //             }

// // //             // Jika ada orderId, hapus dari orderSocketMap
// // //             if (orderId) {
// // //                 delete orderSocketMap[orderId];
// // //                 console.log(`Order ${orderId} is no longer active`);
// // //             }
// // //         }

// // //         // Kirim daftar pengguna online yang diperbarui ke semua klien
// // //         io.emit("getOnlineUsers", getOnlineUsers());

// // //         // Kirim daftar kurir online yang diperbarui ke semua klien
// // //         io.emit("getOnlineCouriers", getOnlineCouriers());

// // //         // Kirim daftar order aktif yang diperbarui ke semua klien
// // //         io.emit("getActiveOrders", getActiveOrders());
// // //     });
// // // });

// // module.exports = { io, app, server, getReceiverSocketId, getOnlineUsers, getOnlineCouriers, getActiveOrders };

// const { Server } = require("socket.io");
// const http = require("http");
// const express = require("express");
// const { user: UserModel } = require("../models");

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//         origin: ["http://localhost:5173"],
//     },
// });

// // Menggunakan Map untuk menyimpan multiple sockets per user
// const userSocketMap = {}; // { userId: Set<socketId> }

// function getReceiverSocketId(userId) {
//     const sockets = userSocketMap[userId];
//     return sockets ? Array.from(sockets) : [];
// }

// function getOnlineUsers() {
//     return Object.keys(userSocketMap);
// }

// io.on("connection", async(socket) => {
//     console.log("A user connected", socket.id);

//     const userId = socket.handshake.query.userId;
//     if (userId) {
//         if (!userSocketMap[userId]) {
//             userSocketMap[userId] = new Set();
//         }
//         userSocketMap[userId].add(socket.id);

//         // Update status ke online hanya jika ini adalah socket pertama
//         if (userSocketMap[userId].size === 1) {
//             try {
//                 await UserModel.update({ status: "online" }, { where: { id: userId } });
//                 console.log(`User ${userId} is now online`);
//             } catch (error) {
//                 console.error("Error updating user status to online:", error);
//             }
//         }
//     }

//     io.emit("getOnlineUsers", getOnlineUsers());

//     socket.on("disconnect", async() => {
//         console.log("A user disconnected", socket.id);

//         if (userId && userSocketMap[userId]) {
//             userSocketMap[userId].delete(socket.id);

//             // Update status ke offline hanya jika tidak ada socket tersisa
//             if (userSocketMap[userId].size === 0) {
//                 delete userSocketMap[userId];
//                 try {
//                     await UserModel.update({ status: "offline" }, { where: { id: userId } });
//                     console.log(`User ${userId} is now offline`);
//                 } catch (error) {
//                     console.error("Error updating user status to offline:", error);
//                 }
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
        origin: ["http://localhost:5173"],
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