// // // require("dotenv").config({ path: path.join(__dirname, "../.env") });
// // require('dotenv').config()

// // const express = require("express");
// // const http = require('http');
// // const { Server } = require('socket.io');

// // const app = express();
// // const server = http.createServer(app);
// // const io = new Server(server, {
// //     cors: {
// //         origin: 'http://localhost:8000', // Ganti dengan URL frontend Anda
// //         methods: ['GET', 'POST'],
// //     },
// // });

// // const PORT = process.env.SERVER_PORT || 8000;

// // const authRouter = require("./routes/auth.router")
// // const productRouter = require("./routes/product.router")
// // const orderRouter = require("./routes/order.router")
// // const cartRouter = require("./routes/cart.router")
// // const chatRouter = require("./routes/chat.router")


// // app.use(express.urlencoded({ extended: true }));
// // app.use(express.json());
// // const cors = require("cors");


// // if (!process.env.JWT_SECRET) {
// //     console.error(
// //         "JWT_SECRET is not provided, fill it with random string or generate it using 'openssl rand -base64/-hex 32'"
// //     );
// //     process.exit(1);
// // }

// // // Menambahkan socket.io ke dalam request object
// // app.use((req, res, next) => {
// //     req.io = io;
// //     next();
// // });

// // app.use(cors());
// // app.use("/api/auth", authRouter)
// // app.use("/api/products", productRouter)
// // app.use("/api/orders", orderRouter)
// // app.use("/api/carts", cartRouter)
// // app.use("/api/chats", chatRouter)


// // io.on('connection', (socket) => {
// //     console.log('A user connected:', socket.id);

// //     // Mendapatkan ID pengguna yang terhubung
// //     socket.on('joinRoom', (chatId) => {
// //         socket.join(chatId);
// //         console.log(`User ${socket.id} joined chat room: ${chatId}`);
// //     });

// //     // Menerima pesan dari klien
// //     socket.on('sendMessage', async({ chatId, senderId, messageContent }) => {
// //         try {
// //             const newMessage = await require('./controllers/chat.controller').sendMessage(chatId, senderId, messageContent);

// //             // Broadcast pesan ke semua pengguna di room
// //             io.to(chatId).emit('receiveMessage', newMessage);
// //         } catch (error) {
// //             console.error('Error sending message:', error);
// //         }
// //     });

// //     socket.on('disconnect', () => {
// //         console.log('A user disconnected:', socket.id);
// //     });
// // });





// // app.listen(process.env.SERVER_PORT || 8000, () => {
// //     console.log(`Server running on http://localhost:${PORT}`);
// // });

// // require('dotenv').config();
// // const express = require('express');
// // const cookieParser = require("cookie-parser");
// // const http = require('http');
// // const { Server } = require('socket.io');
// // const cors = require('cors');
// // const bodyParser = require('body-parser');



// // // Routes
// // const authRouter = require('./routes/auth.router');
// // const productRouter = require('./routes/product.router');
// // const orderRouter = require('./routes/order.router');
// // const cartRouter = require('./routes/cart.router');
// // const chatRouter = require('./routes/chat.router');

// // const app = express();
// // const server = http.createServer(app);
// // const io = new Server(server, {
// //     cors: {
// //         origin: "http://localhost:5173", // URL frontend Anda
// //         credentials: true, // Mengizinkan pengiriman cookie bersama permintaan
// //     },
// // });

// // // Middleware
// // app.use(cookieParser());
// // app.use(cors());
// // app.use(
// //     cors({
// //         origin: "http://localhost:5173",
// //         credentials: true,
// //     })
// // );
// // app.use(express.urlencoded({ extended: true }));
// // app.use(express.json());

// // // Add io to req
// // app.use((req, res, next) => {
// //     req.io = io;
// //     next();
// // });

// // // Routes
// // app.use('/api/auth', authRouter);
// // app.use('/api/products', productRouter);
// // app.use('/api/orders', orderRouter);
// // app.use('/api/carts', cartRouter);
// // app.use('/api/chats', chatRouter);

// // app.use(cors());
// // app.use(bodyParser.json());


// // // Socket.io untuk chat real-time
// // io.on('connection', (socket) => {
// //     console.log('User connected:', socket.id);

// //     socket.on('sendMessage', (data) => {
// //         socket.broadcast.emit('receiveMessage', data);
// //     });

// //     socket.on('disconnect', () => {
// //         console.log('User disconnected:', socket.id);
// //     });
// // });


// // const PORT = process.env.SERVER_PORT || 8000;
// // server.listen(PORT, () => {
// //     console.log(`Server running on http://localhost:${PORT}`);
// // });


// // require('dotenv').config();
// // const express = require('express');
// // const cookieParser = require("cookie-parser");
// // const http = require('http');
// // const { Server } = require('socket.io');
// // const cors = require('cors');
// // const bodyParser = require('body-parser');
// // const jwt = require('jsonwebtoken');

// // // Routes
// // const authRouter = require('./routes/auth.router');
// // const productRouter = require('./routes/product.router');
// // const orderRouter = require('./routes/order.router');
// // const cartRouter = require('./routes/cart.router');
// // const chatRouter = require('./routes/chat.router');

// // // Middleware untuk autentikasi JWT
// // const authenticate = (req, res, next) => {
// //     const token = req.cookies.token;
// //     if (!token) {
// //         return res.status(401).json({ message: "Unauthorized" });
// //     }
// //     try {
// //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //         req.user = decoded; // Menambahkan data pengguna ke req.user
// //         next();
// //     } catch (error) {
// //         return res.status(401).json({ message: "Unauthorized" });
// //     }
// // };

// // const app = express();
// // const server = http.createServer(app);

// // // Socket.io setup
// // const io = new Server(server, {
// //     cors: {
// //         origin: "http://localhost:5173", // URL frontend Anda
// //         credentials: true, // Mengizinkan pengiriman cookie bersama permintaan
// //     },
// // });

// // // Middleware
// // app.use(cookieParser());
// // app.use(cors({
// //     origin: "http://localhost:5173", // URL frontend Anda
// //     credentials: true, // Mengizinkan pengiriman cookie bersama permintaan
// // }));
// // app.use(express.urlencoded({ extended: true }));
// // app.use(express.json());

// // // Add io to req
// // app.use((req, res, next) => {
// //     req.io = io;
// //     next();
// // });

// // // Routes
// // app.use('/api/auth', authRouter);
// // app.use('/api/products', productRouter);
// // app.use('/api/orders', orderRouter);
// // app.use('/api/carts', cartRouter);
// // app.use('/api/chats', authenticate, chatRouter); // Melindungi rute chat dengan autentikasi

// // // Socket.io untuk chat real-time
// // io.on('connection', (socket) => {
// //     console.log('User connected:', socket.id);

// //     socket.on('sendMessage', (data) => {
// //         socket.broadcast.emit('receiveMessage', data);
// //     });

// //     socket.on('disconnect', () => {
// //         console.log('User disconnected:', socket.id);
// //     });
// // });

// // const PORT = process.env.SERVER_PORT || 8000;
// // server.listen(PORT, () => {
// //     console.log(`Server running on http://localhost:${PORT}`);
// // });

// //!awal

// // require('dotenv').config();
// // const express = require('express');
// // const cookieParser = require("cookie-parser");
// // const http = require('http');
// // const { Server } = require('socket.io');
// // const cors = require('cors');
// // const bodyParser = require('body-parser');

// // // Routes
// // const authRouter = require('./routes/auth.router');
// // const productRouter = require('./routes/product.router');
// // const orderRouter = require('./routes/order.router');
// // const cartRouter = require('./routes/cart.router');
// // const chatRouter = require('./routes/chat.router');

// // const app = express();
// // const server = http.createServer(app);
// // const io = new Server(server, {
// //     cors: {
// //         origin: "http://localhost:5173", // URL frontend Anda
// //         credentials: true, // Mengizinkan pengiriman cookie bersama permintaan
// //     },
// // });

// // // Middleware
// // app.use(cookieParser());
// // app.use(
// //     cors({
// //         origin: "http://localhost:5173", // URL frontend Anda
// //         credentials: true, // Mengizinkan pengiriman cookie bersama permintaan
// //     })
// // );
// // app.use(express.urlencoded({ extended: true }));
// // app.use(express.json());

// // // Add io to req
// // app.use((req, res, next) => {
// //     req.io = io;
// //     next();
// // });

// // // Routes
// // app.use('/api/auth', authRouter);
// // app.use('/api/products', productRouter);
// // app.use('/api/orders', orderRouter);
// // app.use('/api/carts', cartRouter);
// // app.use('/api/chats', chatRouter);

// // app.use(bodyParser.json());

// // // Socket.io untuk chat real-time
// // io.on('connection', (socket) => {
// //     console.log('User connected:', socket.id);

// //     socket.on('sendMessage', (data) => {
// //         socket.broadcast.emit('receiveMessage', data);
// //     });

// //     socket.on('disconnect', () => {
// //         console.log('User disconnected:', socket.id);
// //     });
// // });

// // const PORT = process.env.SERVER_PORT || 8000;
// // server.listen(PORT, () => {
// //     console.log(`Server running on http://localhost:${PORT}`);
// // });

// //!akhir

// // require('dotenv').config();
// // const express = require('express');
// // const cookieParser = require("cookie-parser");
// // const http = require('http');
// // const { Server } = require('socket.io');
// // const cors = require('cors');
// // const bodyParser = require('body-parser');

// // // Routes
// // const authRouter = require('./routes/auth.router');
// // const productRouter = require('./routes/product.router');
// // const orderRouter = require('./routes/order.router');
// // const cartRouter = require('./routes/cart.router');
// // const chatRouter = require('./routes/chat.router');



// // const { app, server } = require("./config/socket");

// // // dotenv.config();



// // app.use(express.json());
// // app.use(cookieParser());
// // app.use(
// //     cors({
// //         origin: "http://localhost:5173",
// //         credentials: true,
// //     })
// // );

// // // const server = http.createServer(app);
// // const io = new Server(server, {
// //     cors: {
// //         origin: "http://localhost:5173", // URL frontend Anda
// //         credentials: true, // Mengizinkan pengiriman cookie bersama permintaan
// //     },
// // });

// // // Middleware
// // app.use(cookieParser());
// // app.use(
// //     cors({
// //         origin: "http://localhost:5173", // URL frontend Anda
// //         credentials: true, // Mengizinkan pengiriman cookie bersama permintaan
// //     })
// // );
// // app.use(express.urlencoded({ extended: true }));
// // app.use(express.json());

// // // Add io to req
// // app.use((req, res, next) => {
// //     req.io = io;
// //     next();
// // });

// // // Routes
// // app.use('/api/auth', authRouter);
// // app.use('/api/products', productRouter);
// // app.use('/api/orders', orderRouter);
// // app.use('/api/carts', cartRouter);
// // app.use('/api/chats', chatRouter);

// // app.use(bodyParser.json());


// // const PORT = process.env.SERVER_PORT || 8000;
// // server.listen(PORT, () => {
// //     console.log(`Server running on http://localhost:${PORT}`);
// // });

// require('dotenv').config();
// const express = require('express');
// const cookieParser = require("cookie-parser");
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const { addOnlineCourier, removeOnlineCourier } = require("./config/socket");
// const { user: UserModel } = require("./models");

// // Routes
// const authRouter = require('./routes/auth.router');
// const productRouter = require('./routes/product.router');
// const orderRouter = require('./routes/order.router');
// const cartRouter = require('./routes/cart.router');
// const chatRouter = require('./routes/chat.router');
// const paymentRouter = require('./routes/payment.router');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:5173", // URL frontend Anda
//         credentials: true, // Mengizinkan pengiriman cookie bersama permintaan
//     },
// });

// // **Daftar Kurir Online** menggunakan Map untuk menyimpan socketId dan courierId
// const onlineCouriers = new Map();

// // Middleware
// app.use(cookieParser());
// app.use(
//     cors({
//         origin: "http://localhost:5173", // URL frontend Anda
//         credentials: true, // Mengizinkan pengiriman cookie bersama permintaan
//     })
// );
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // Middleware untuk menambahkan io dan daftar kurir online ke req
// app.use((req, res, next) => {
//     req.io = io;
//     req.onlineCouriers = Array.from(onlineCouriers.values()); // Hanya nilai courierId
//     next();
// });

// // Routes
// app.use('/api/auth', authRouter);
// app.use('/api/products', productRouter);
// app.use('/api/orders', orderRouter); // Daftar kurir online tersedia di orderRouter
// app.use('/api/carts', cartRouter);
// app.use('/api/chats', chatRouter);
// app.use('/api/payments', paymentRouter);

// app.use(bodyParser.json());

// // **Socket.IO untuk Kurir dan Pesan Real-time**
// // io.on('connection', (socket) => {
// //     console.log('User connected:', socket.id);

// //     // Saat kurir bergabung
// //     socket.on('joinCourier', (courierId) => {
// //         onlineCouriers.set(socket.id, courierId);
// //         console.log(`Courier ${courierId} is now online`);
// //     });

// //     // Saat pengguna terputus
// //     socket.on('disconnect', () => {
// //         if (onlineCouriers.has(socket.id)) {
// //             const courierId = onlineCouriers.get(socket.id);
// //             onlineCouriers.delete(socket.id);
// //             console.log(`Courier ${courierId} is now offline`);
// //         }
// //     });

// // });


// // const { user: UserModel } = require("./models"); // Import model User untuk akses database

// //!awal
// // io.on('connection', (socket) => {
// //     console.log('User connected:', socket.id);

// //     // Saat kurir bergabung
// //     socket.on('joinCourier', async(userId) => {
// //         console.log("userId", userId);
// //         try {
// //             // Menandai kurir sebagai online di database
// //             const user = await UserModel.findByPk(userId);
// //             if (user) {
// //                 user.status = 'online'; // Pastikan ada kolom status di tabel user
// //                 await user.save();
// //                 onlineusers.set(socket.id, userId);
// //                 // console.log(`user ${userId} is now online`);
// //             }
// //         } catch (error) {
// //             console.error('Error updating user status:', error);
// //         }
// //     });

// //     // Saat pengguna terputus
// //     socket.on('disconnect', async() => {
// //         if (onlineusers.has(socket.id)) {
// //             const userId = onlineusers.get(socket.id);
// //             try {
// //                 // Menandai kurir sebagai offline di database
// //                 const user = await UserModel.findByPk(userId);
// //                 if (user) {
// //                     user.status = 'offline'; // Pastikan ada kolom status di tabel user
// //                     await user.save();
// //                     onlineusers.delete(socket.id);
// //                     console.log(`user ${userId} is now offline`);
// //                 }
// //             } catch (error) {
// //                 console.error('Error updating user status on disconnect:', error);
// //             }
// //         }
// //     });

// // });

// //!akhir

// const onlineUsers = new Map();

// io.on('connection', (socket) => {
//     console.log('A user connected:', socket.id);

//     socket.on('joinCourier', async(userId) => {
//         console.log("userId", userId);
//         try {
//             // Menandai kurir sebagai online di database
//             const user = await UserModel.findByPk(userId);

//             console.log("user", user);
//             if (user) {
//                 user.status = 'online'; // Pastikan ada kolom status di tabel user
//                 await user.save();
//                 onlineUsers.set(socket.id, userId);
//                 console.log(`User ${userId} is now online`);
//             }
//         } catch (error) {
//             console.error('Error updating user status:', error);
//         }
//     });

//     socket.on('disconnect', async() => {
//         const userId = onlineUsers.get(socket.id);
//         if (userId) {
//             try {
//                 // Menandai kurir sebagai offline di database
//                 const user = await UserModel.findByPk(userId);
//                 if (user) {
//                     user.status = 'offline'; // Pastikan ada kolom status di tabel user
//                     await user.save();
//                     onlineUsers.delete(socket.id);
//                     console.log(`User ${userId} is now offline`);
//                 }
//             } catch (error) {
//                 console.error('Error updating user status:', error);
//             }
//         }
//         console.log('A user disconnected:', socket.id);
//     });
// });



// // const socketIdMap = {}; // Menyimpan mapping userId ke socketId

// // io.on('connection', (socket) => {
// //     const userId = socket.handshake.query.userId;

// //     if (userId) {
// //         socketIdMap[userId] = socket.id; // Menyimpan socketId berdasarkan userId
// //     }

// //     socket.on('disconnect', () => {
// //         // Hapus socketId saat user disconnect
// //         delete socketIdMap[userId];
// //     });
// // });



// // **Socket.IO untuk Kurir dan Pesan Real-time**
// // io.on("connection", (socket) => {
// //     console.log("User connected:", socket.id);

// //     // Ketika kurir online
// //     socket.on("courierOnline", (courierId) => {
// //         addOnlineCourier(courierId, socket.id, onlineCouriers); // Memanggil fungsi untuk menandakan kurir online
// //         console.log("Kurir online:", Array.from(onlineCouriers.values()));
// //     });

// //     // Ketika kurir offline (disconnect)
// //     socket.on("disconnect", () => {
// //         removeOnlineCourier(socket.id, onlineCouriers); // Memanggil fungsi untuk menandakan kurir offline
// //         console.log("Kurir offline:", Array.from(onlineCouriers.values()));
// //     });
// // });


// // **Port Listening**
// const PORT = process.env.SERVER_PORT || 8000;
// server.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });










// // require('dotenv').config();
// // const express = require('express');
// // const cookieParser = require("cookie-parser");
// // const http = require('http');
// // const { Server } = require('socket.io');
// // const cors = require('cors');
// // const bodyParser = require('body-parser');
// // const { addOnlineCourier, removeOnlineCourier } = require("./config/socket");

// // // Routes
// // const authRouter = require('./routes/auth.router');
// // const productRouter = require('./routes/product.router');
// // const orderRouter = require('./routes/order.router');
// // const cartRouter = require('./routes/cart.router');
// // const chatRouter = require('./routes/chat.router');

// // const app = express();
// // const server = http.createServer(app);
// // const io = new Server(server, {
// //     cors: {
// //         origin: "http://localhost:5173", // URL frontend Anda
// //         credentials: true, // Mengizinkan pengiriman cookie bersama permintaan
// //     },
// // });

// // // Daftar Kurir Online menggunakan Map untuk menyimpan socketId dan courierId
// // const onlineCouriers = new Map();

// // // Middleware
// // app.use(cookieParser());
// // app.use(
// //     cors({
// //         origin: "http://localhost:5173", // URL frontend Anda
// //         credentials: true, // Mengizinkan pengiriman cookie bersama permintaan
// //     })
// // );
// // app.use(express.urlencoded({ extended: true }));
// // app.use(express.json());

// // // Middleware untuk menambahkan io dan daftar kurir online ke req
// // app.use((req, res, next) => {
// //     req.io = io;
// //     req.onlineCouriers = Array.from(onlineCouriers.values()); // Hanya nilai courierId
// //     next();
// // });

// // // Routes
// // app.use('/api/auth', authRouter);
// // app.use('/api/products', productRouter);
// // app.use('/api/orders', orderRouter);
// // app.use('/api/carts', cartRouter);
// // app.use('/api/chats', chatRouter);

// // app.use(bodyParser.json());

// // // Socket.IO untuk Kurir dan Pesan Real-time
// // io.on("connection", (socket) => {
// //     console.log("User connected:", socket.id);

// //     // Ketika kurir online
// //     socket.on("courierOnline", (courierId) => {
// //         addOnlineCourier(courierId, socket.id); // Memanggil fungsi untuk menandakan kurir online
// //         console.log("Kurir online:", Array.from(onlineCouriers.values()));
// //     });

// //     // Ketika kurir offline (disconnect)
// //     socket.on("disconnect", () => {
// //         removeOnlineCourier(socket.id); // Memanggil fungsi untuk menandakan kurir offline
// //         console.log("Kurir offline:", Array.from(onlineCouriers.values()));
// //     });
// // });

// // // Port Listening
// // const PORT = process.env.SERVER_PORT || 8000;
// // server.listen(PORT, () => {
// //     console.log(`Server running on http://localhost:${PORT}`);
// // });


// require("dotenv").config();
// const express = require("express");
// const cookieParser = require("cookie-parser");
// const http = require("http");
// const cors = require("cors");
// const bodyParser = require("body-parser");

// const { server, io } = require("./config/socket");
// const { user: UserModel } = require("./models");

// // Routes
// const authRouter = require("./routes/auth.router");
// const productRouter = require("./routes/product.router");
// const orderRouter = require("./routes/order.router");
// const cartRouter = require("./routes/cart.router");
// const chatRouter = require("./routes/chat.router");
// const paymentRouter = require("./routes/payment.router");

// const app = express();

// // Middleware
// app.use(cookieParser());
// app.use(
//     cors({
//         origin: "http://localhost:5173", // Sesuaikan dengan domain frontend
//         credentials: true, // Penting jika menggunakan cookies atau token auth
//         methods: ["GET", "POST", "PUT", "DELETE"], // Sesuaikan metode yang diperbolehkan
//         allowedHeaders: ["Content-Type", "Authorization"], // Header yang diizinkan
//     })
// );
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(bodyParser.json());

// // Middleware untuk menambahkan io ke req
// app.use((req, res, next) => {
//     req.io = io;
//     next();
// });

// // Routes
// app.use('/api/auth', authRouter);
// app.use('/api/products', productRouter);
// app.use('/api/orders', orderRouter); // Daftar kurir online tersedia di orderRouter
// app.use('/api/carts', cartRouter);
// app.use('/api/chats', chatRouter);
// app.use('/api/payments', paymentRouter);


// // Menangani koneksi socket
// io.on("connection", (socket) => {
//     console.log("A user connected:", socket.id);

//     socket.on("joinCourier", async(userId) => {
//         console.log("User ID:", userId);
//         try {
//             const user = await UserModel.findByPk(userId);
//             if (user) {
//                 user.status = "online";
//                 await user.save();
//                 console.log(`User ${userId} is now online`);
//             }
//         } catch (error) {
//             console.error("Error updating user status:", error);
//         }
//     });

//     socket.on("disconnect", async() => {
//         console.log("A user disconnected:", socket.id);
//     });
// });

// // Menjalankan server
// const PORT = process.env.SERVER_PORT || 8000;
// server.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });







require('dotenv').config();
const express = require('express');
const cookieParser = require("cookie-parser");
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const { io, app, server } = require("./config/socket"); // Impor dari socket.js

// Routes
const authRouter = require('./routes/auth.router');
const userRouter = require('./routes/user.router');
const productRouter = require('./routes/product.router');
const variantRouter = require('./routes/variant.router');
const orderRouter = require('./routes/order.router');
const cartRouter = require('./routes/cart.router');
const chatRouter = require('./routes/chat.router');
const paymentRouter = require('./routes/payment.router');
const order_historieRouter = require('./routes/order_historie.router');
const ratingRouter = require('./routes/rating.router');
const earningRouter = require('./routes/earning.roter');
const midtransRouter = require('./routes/midtrans.router');
const callRouter = require('./routes/call.router');

// Middleware
app.use(cookieParser());
app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"], // URL frontend Anda
        credentials: true, // Mengizinkan pengiriman cookie bersama permintaan
        exposedHeaders: ['set-cookie', 'authorization']
    })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware untuk menambahkan io ke req
app.use((req, res, next) => {
    req.io = io;
    next();
});


// Routes
app.use('/api/auth', authRouter);
app.use('/api/couriers', userRouter);
app.use('/api/products', productRouter);
app.use('/api/variants', variantRouter);
app.use('/api/orders', orderRouter);
app.use('/api/carts', cartRouter);
app.use('/api/chats', chatRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/order_histories', order_historieRouter);
app.use('/api/ratings', ratingRouter);
app.use('/api/earnings', earningRouter);
app.use("/api/midtrans", midtransRouter);
app.use('/api/calls', callRouter);

app.use(bodyParser.json());
const initCourierAvailabilityCron = require('./middlewares/crons');
initCourierAvailabilityCron();

// **Port Listening**
const PORT = process.env.SERVER_PORT || 8001;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});