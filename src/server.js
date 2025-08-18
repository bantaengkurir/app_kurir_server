require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const { io, app, server } = require("./config/socket");
const passport = require('passport');
require('./config/passport');
const jwt = require('jsonwebtoken');

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
// const { UserModel } = require('./models');
const { user: UserModel } = require("./models");

// Middleware
app.use(cors({
    origin: [
        "https://app-dessert-cra-admin.vercel.app",
        "https://bantaeng-dessert.vercel.app",
        "https://app-dessert-cra-courier.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:5173"
    ],
    credentials: true,
    exposedHeaders: ['authorization'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(passport.initialize());


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
app.use('/api/users', userRouter);
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
// Routes Google OAuth
app.get('/auth/google', passport.authenticate('google', { session: false }));

// app.get(
//     '/auth/google/callback',
//     passport.authenticate('google', { session: false }),
//     async(req, res) => {
//         try {
//             const user = req.user;

//             // Generate token
//             const token = jwt.sign({
//                     id: user.id,
//                     username: user.name,
//                     email: user.email,
//                     role: user.role,
//                 },
//                 process.env.JWT_SECRET, { expiresIn: '1h' }
//             );

//             // Redirect ke frontend dengan token
//             res.redirect(`${process.env.CLIENT_URL}/auth?token=${token}`);
//         } catch (error) {
//             console.error('Google auth error:', error);
//             res.redirect(`${process.env.CLIENT_URL}/auth?error=authentication_failed`);
//         }
//     }
// );

app.get(
    '/auth/google/callback',
    passport.authenticate('google', { session: false }),
    async(req, res) => {
        try {
            const googleUser = req.user;

            // Ambil data lengkap user dari DB
            const fullUser = await UserModel.findByPk(googleUser.id, {
                attributes: [
                    'id', 'name', 'email', 'address',
                    'phone_number', 'profile_image', 'role',
                    'createdAt'
                ]
            });

            if (!fullUser) {
                return res.redirect(`${process.env.CLIENT_URL}/auth?error=user_not_found`);
            }

            const user = fullUser.get({ plain: true });

            // Bungkus di dalam { user: ... }
            // const token = jwt.sign({ user },
            //     process.env.JWT_SECRET, { expiresIn: '1h' }
            // );
            const token = jwt.sign({
                    id: googleUser.id,
                    name: googleUser.name,
                    email: googleUser.email,
                    role: googleUser.role,
                    phone_number: googleUser.phone_number,
                    address: googleUser.address,
                    profile_image: googleUser.profile_image,
                    // field lain yang diperlukan
                },
                process.env.JWT_SECRET, { expiresIn: '1h' }
            );



            // Kirim ke frontend
            res.redirect(`${process.env.CLIENT_URL}/auth?token=${token}`);
        } catch (error) {
            console.error('Google auth error:', error);
            res.redirect(`${process.env.CLIENT_URL}/auth?error=authentication_failed`);
        }
    }
);

const initCourierAvailabilityCron = require('./middlewares/crons');
initCourierAvailabilityCron();

// Port Listening
const PORT = process.env.SERVER_PORT || 8001;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});