require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const { io, app, server } = require("./config/socket");

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
app.use(cors({
    origin: [
        "https://app-dessert-cra-admin.vercel.app",
        "https://bantaeng-dessert.vercel.app",
        "https://app-dessert-cra-courier.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003"
    ],
    credentials: true,
    exposedHeaders: ['authorization'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());

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

const initCourierAvailabilityCron = require('./middlewares/crons');
initCourierAvailabilityCron();

// Port Listening
const PORT = process.env.SERVER_PORT || 8001;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});