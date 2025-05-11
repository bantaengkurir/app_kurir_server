const {
    payment: PaymentModel,
    order: OrderModel,
    shipping_cost: ShippingModel,
    orderitem: OrderItemModel,
    product: ProductModel,
    order_historie: OrderHistoryModel,
    sequelize,
} = require("../models");
const crypto = require('crypto');
const { saveOrderHistory } = require("../middlewares/order_history.helper");
const midtransClient = require("midtrans-client");

const Pusher = require('pusher');
const { Sequelize } = require("sequelize");

// Konfigurasi Pusher
const pusher = new Pusher({
    appId: "1948721",
    key: "27dd26c02b96af0f4e50",
    secret: "231f888aa4f383cb2b18",
    cluster: "ap1",
    useTLS: true
});

// Konfigurasi Midtrans
const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: "SB-Mid-server-t2OpglXq5gsZp_1BlSlfiamo",
    clientKey: "SB-Mid-client-7-zhKMrkvYRGbMxq"
});


/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */

const index = async(req, res, _next) => {
    try {
        const currentUser = req.user;

        console.log("user", currentUser)

        let payments;


        payments = await PaymentModel.findAll({
            include: [{
                model: OrderModel,
                as: "order",

            }, ],
        });


        return res.send({
            message: "Success",
            data: payments,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }

};

// // const createPayment = async(req, res) => {
// //     try {
// //         const { order_id } = req.params; // Ambil order_id dari params
// //         const { payment_method } = req.body; // Ambil payment_method dari body

// //         // Validasi input
// //         if (!order_id) {
// //             return res.status(400).send({ message: "order_id wajib diisi di URL params" });
// //         }

// //         if (!payment_method) {
// //             return res.status(400).send({ message: "payment_method wajib diisi di body" });
// //         }

// //         // Validasi metode pembayaran
// //         const validPaymentMethods = ["COD", "transfer"];
// //         if (!validPaymentMethods.includes(payment_method)) {
// //             return res.status(400).send({ message: "Metode pembayaran tidak valid" });
// //         }

// //         // Cari order berdasarkan order_id
// //         const order = await OrderModel.findOne({
// //             where: { id: order_id },
// //             include: [{ model: ShippingModel, as: "shipping_cost" }],
// //         });

// //         if (!order) {
// //             return res.status(404).send({ message: "Order tidak ditemukan" });
// //         }

// //         // Hitung total amount
// //         const cost = order.shipping_cost ? order.shipping_cost[0].shipping_cost || 0 : 0;
// //         const amount = parseFloat(order.total_price) + parseFloat(cost);

// //         console.log("cost", cost);

// //         // let payment_status = "pending"; // Nilai default
// //         if (payment_method == "COD") {
// //             payment_status = "completed";
// //         } else if (payment_method == "transfer") {
// //             payment_status = "process";
// //         }


// //         if (order_id == order.order_id || order.status == 'process' || order.status == 'completed') {
// //             return res.status(403).send({ message: `pembayaran dalam keadaan ${order.status}` });
// //         } else if (order.status == 'cancelled' || order.status == 'failed') {
// //             return res.status(403).send({ message: `pembayaran dalam keadaan ${order.status}` });
// //         }


// //         // Buat data pembayaran
// //         const payment = await PaymentModel.create({
// //             order_id,
// //             user_id: order.user_id,
// //             courier_id: order.courier_id,
// //             payment_method,
// //             amount,
// //             payment_status: payment_status,
// //             payment_date: new Date(),
// //         });

// //         await OrderModel.update({
// //             status: "process",
// //             payment_status: payment_status,
// //         }, {
// //             where: {
// //                 id: order_id,
// //             },
// //         });

// //         return res.status(201).send({
// //             message: "Pembayaran berhasil dibuat",
// //             data: payment,
// //         });
// //     } catch (error) {
// //         console.error("Error:", error.message);
// //         return res.status(500).send({ message: "Internal Server Error" });
// //     }
// // };

//tanpa midtrans
// const createPayment = async(req, res) => {
//     try {
//         const { order_id } = req.params; // Ambil order_id dari params
//         const currentUser = req.user.id; // Ambil user ID dari token/auth
//         const { payment_method } = req.body; // Ambil payment_method dari body

//         // // Validasi input
//         // if (!order_id) {
//         //     return res.status(400).send({ message: "order_id wajib diisi di URL params" });
//         // }

//         // if (!payment_method) {
//         //     return res.status(400).send({ message: "payment_method wajib diisi di body" });
//         // }

//         // // Validasi metode pembayaran
//         // const validPaymentMethods = ["COD", "transfer"];
//         // if (!validPaymentMethods.includes(payment_method)) {
//         //     return res.status(400).send({ message: "Metode pembayaran tidak valid" });
//         // }

//         // Cari order berdasarkan order_id
//         const order = await OrderModel.findOne({
//             where: { id: order_id },
//             include: [{ model: ShippingModel, as: "shipping_cost" }],
//         });

//         if (!order) {
//             return res.status(404).send({ message: "Order tidak ditemukan" });
//         }

//         // Hitung total amount
//         const cost = order.shipping_cost ? order.shipping_cost[0].shipping_cost || 0 : 0;
//         const amount = parseFloat(order.total_price) + parseFloat(cost);

//         console.log("Shipping Cost:", cost);
//         console.log("Total Amount:", amount);

//         // Tentukan status pembayaran
//         let payment_status = "pending"; // Nilai default
//         if (payment_method === "COD" || payment_method === "transfer") {
//             payment_status = "process";
//         }

//         // Buat riwayat pembayaran
//         if (payment_method === 'COD') {
//             await OrderHistoryModel.create({
//                 order_id,
//                 user_id: currentUser,
//                 status: payment_status,
//                 note: `Lakukan pembayaran setelah barang diterima`,
//             });
//         } else {
//             await OrderHistoryModel.create({
//                 order_id,
//                 user_id: currentUser,
//                 status: payment_status,
//                 note: `Pembayaran dalam keadaan ${payment_status}`,
//             });
//         }

//         // Buat data pembayaran
//         const payment = await PaymentModel.create({
//             order_id,
//             user_id: order.user_id,
//             courier_id: order.courier_id,
//             payment_method,
//             amount,
//             payment_status: payment_status,
//             payment_date: new Date(),
//         });

//         // Update status order
//         await OrderModel.update({
//             status: "process",
//             payment_status: payment_status,
//         }, {
//             where: {
//                 id: order_id,
//             },
//         });

//         // Proses update produk jika pembayaran berhasil
//         if (payment_status === "process" || payment_status === "completed") {
//             // Ambil semua item dari order
//             const orderItems = await OrderItemModel.findAll({
//                 where: { order_id: order.id },
//             });

//             // Update stok dan sold untuk setiap produk
//             for (let item of orderItems) {
//                 const product = await ProductModel.findOne({
//                     where: { id: item.product_id },
//                 });

//                 if (product) {
//                     // Pastikan ada cukup stok untuk mengurangi
//                     if (product.stock >= item.quantity) {
//                         // Kurangi stok dan tambahkan jumlah sold
//                         await ProductModel.update({
//                             stock: product.stock - item.quantity,
//                             total_sold: product.total_sold + item.quantity,
//                         }, {
//                             where: { id: product.id },
//                         });
//                     } else {
//                         return res.status(400).send({ message: `Stok produk ${product.name} tidak cukup` });
//                     }
//                 }
//             }

//             // Kirim data order ke Pusher
//             try {
//                 pusher.trigger('orders', 'new-order', {
//                     order_id: order.id,
//                     user_id: order.user_id,
//                     courier_id: order.courier_id,
//                     total: amount,
//                     items: orderItems.map((item) => ({
//                         product_id: item.product_id,
//                         name: item.name,
//                         quantity: item.quantity,
//                         price: item.price,
//                     })),
//                 });

//                 console.log("Data yang dikirim ke Pusher:", {
//                     order_id: order.id,
//                     user_id: order.user_id,
//                     courier_id: order.courier_id,
//                     total: amount,
//                     items: orderItems,
//                 });
//             } catch (pusherError) {
//                 console.error("Gagal mengirim data ke Pusher:", pusherError);
//             }
//         }

//         // Response sukses
//         return res.status(201).send({
//             message: "Pembayaran berhasil dibuat",
//             data: payment,
//         });
//     } catch (error) {
//         console.error("Error:", error.message);
//         return res.status(500).send({ message: "Internal Server Error" });
//     }
// };


//dengan midtrans
// const createPayment = async(req, res) => {
//     try {
//         const { order_id } = req.params;
//         const currentUser = req.user;
//         const { payment_method } = req.body;

//         // Input validation
//         if (!order_id) {
//             return res.status(400).json({ message: "Order ID wajib diisi" });
//         }

//         if (!payment_method || !['COD', 'transfer'].includes(payment_method)) {
//             return res.status(400).json({ message: "Metode pembayaran tidak valid" });
//         }

//         // Find order
//         const order = await OrderModel.findOne({
//             where: { id: order_id },
//             include: [{ model: ShippingModel, as: 'shipping_cost' }]
//         });

//         if (!order) {
//             return res.status(404).json({ message: "Order tidak ditemukan" });
//         }

//         // Calculate total amount
//         const shippingCost = order.shipping_cost ? order.shipping_cost[0].shipping_cost || 0 : 0;
//         const amount = parseFloat(order.total_price) + parseFloat(shippingCost);

//         console.log("shipping cost", shippingCost);
//         console.log("ampount", amount)

//         // Determine status based on payment method
//         const payment_status = payment_method === 'COD' ? 'completed' : 'pending';
//         const order_status = payment_method === 'COD' ? 'process' : 'pending';

//         // Create order history
//         await OrderHistoryModel.create({
//             order_id,
//             user_id: currentUser.id,
//             status: order_status,
//             note: payment_method === 'COD' ?
//                 'Pembayaran COD - Bayar saat barang diterima' : 'Menunggu pembayaran transfer'
//         });

//         // Create payment record
//         const payment = await PaymentModel.create({
//             order_id,
//             user_id: currentUser.id,
//             payment_method,
//             amount,
//             payment_status,
//             payment_date: new Date()
//         });

//         // Update order status
//         await OrderModel.update({ status: order_status, payment_status }, { where: { id: order_id } });

//         // Process based on payment method
//         if (payment_method === 'transfer') {
//             // Create Midtrans transaction
//             const parameter = {
//                 transaction_details: {
//                     order_id: `PAYMENT-${payment.id}`,
//                     gross_amount: amount
//                 },
//                 credit_card: { secure: true },
//                 customer_details: {
//                     first_name: currentUser.username,
//                     email: currentUser.email,
//                     phone: currentUser.phone_number
//                 },
//                 callbacks: {
//                     // finish: `${process.env.FRONTEND_URL}/payment-success`,
//                     // error: `${process.env.FRONTEND_URL}/payment-error`
//                     finish: 'http://localhost:5174/orderhistories',
//                     error: 'http://localhost:5174/payment'
//                 }
//             };

//             const midtransTransaction = await snap.createTransaction(parameter);

//             // Update payment with Midtrans token
//             await payment.update({
//                 midtrans_token: midtransTransaction.token,
//                 midtrans_order_id: parameter.transaction_details.order_id
//             });

//                     // Create order history
//         await OrderHistoryModel.create({
//             order_id,
//             user_id: currentUser.id,
//             status: "process",
//             note: 'Pembayaran Berhasil'
//         });

//         // Create payment record
//         const payment = await PaymentModel.update({
//             order_id,
//             user_id: currentUser.id,
//             payment_method: 'transfer',
//             amount,
//             payment_status : 'completed',
//             payment_date: new Date()
//         });

//             // Trigger Pusher for transfer payment notification
//             pusher.trigger('payment-channel', 'payment-created', {
//                 order_id,
//                 payment_id: payment.id,
//                 amount,
//                 payment_url: midtransTransaction.redirect_url,
//                 message: 'Silakan lanjutkan pembayaran'
//             });

//             return res.status(201).json({
//                 message: "Silakan lanjutkan pembayaran",
//                 payment_url: midtransTransaction.redirect_url,
//                 payment_data: payment
//             });
//         } else {
//             // Process COD - reduce stock immediately
//             const orderItems = await OrderItemModel.findAll({
//                 where: { order_id }
//             });

//             for (const item of orderItems) {
//                 const product = await ProductModel.findByPk(item.product_id);
//                 if (product) {
//                     if (product.stock < item.quantity) {
//                         return res.status(400).json({
//                             message: `Stok ${product.name} tidak mencukupi`
//                         });
//                     }
//                     await product.update({
//                         stock: product.stock - item.quantity,
//                         total_sold: product.total_sold + item.quantity
//                     });
//                 }
//             }

//             // Trigger Pusher for COD order
//             pusher.trigger('order-channel', 'cod-order-created', {
//                 order_id,
//                 user_id: currentUser.id,
//                 payment_method: 'COD',
//                 amount,
//                 status: 'process',
//                 items: orderItems.map(item => ({
//                     product_id: item.product_id,
//                     quantity: item.quantity,
//                     price: item.price
//                 }))
//             });

//             return res.status(201).json({
//                 message: "Pembayaran COD berhasil diproses",
//                 payment_data: payment
//             });
//         }
//     } catch (error) {
//         console.error('Payment Error:', error);
//         return res.status(500).json({
//             message: "Terjadi kesalahan saat memproses pembayaran",
//             error: error.message
//         });
//     }
// };

// const handleMidtransNotification = async(req, res) => {
//     try {
//         const notification = req.body;
//         const statusResponse = await snap.transaction.notification(notification);

//         const paymentId = statusResponse.order_id.split('-')[1];
//         const transactionStatus = statusResponse.transaction_status;
//         const fraudStatus = statusResponse.fraud_status;

//         console.log(`Midtrans Notification:`, {
//             paymentId,
//             status: transactionStatus,
//             fraudStatus
//         });

//         // Find related payment
//         const payment = await PaymentModel.findByPk(paymentId);
//         if (!payment) {
//             return res.status(404).json({ message: "Payment tidak ditemukan" });
//         }

//         let updateData = {};
//         let orderStatus = payment.order_status;

//         // Process payment status
//         if (transactionStatus === 'capture' && fraudStatus === 'accept') {
//             updateData.payment_status = 'completed';
//             orderStatus = 'process';
//         } else if (transactionStatus === 'settlement') {
//             updateData.payment_status = 'completed';
//             orderStatus = 'process';
//         } else if (['deny', 'cancel', 'expire'].includes(transactionStatus)) {
//             updateData.payment_status = 'failed';
//             orderStatus = 'cancelled';
//         } else if (transactionStatus === 'pending') {
//             updateData.payment_status = 'pending';
//         }

//         // Update payment and order
//         await payment.update(updateData);
//         await OrderModel.update({
//             payment_status: updateData.payment_status,
//             status: orderStatus
//         }, { where: { id: payment.order_id } });

//         // If payment successful, reduce stock
//         if (updateData.payment_status === 'completed') {
//             const orderItems = await OrderItemModel.findAll({
//                 where: { order_id: payment.order_id }
//             });

//             for (const item of orderItems) {
//                 const product = await ProductModel.findByPk(item.product_id);
//                 if (product) {
//                     await product.update({
//                         stock: product.stock - item.quantity,
//                         total_sold: product.total_sold + item.quantity
//                     });
//                 }
//             }

//             // Create order history
//             await OrderHistoryModel.create({
//                 order_id: payment.order_id,
//                 user_id: payment.user_id,
//                 status: orderStatus,
//                 note: 'Pembayaran transfer berhasil'
//             });

//             // Trigger Pusher for successful payment
//             pusher.trigger('payment-channel', 'payment-completed', {
//                 order_id: payment.order_id,
//                 payment_id: payment.id,
//                 status: 'completed',
//                 message: 'Pembayaran berhasil diproses'
//             });
//         }

//         // Trigger payment status notification
//         pusher.trigger('order-channel', 'payment-status-updated', {
//             order_id: payment.order_id,
//             payment_status: updateData.payment_status,
//             transaction_status: transactionStatus
//         });

//         return res.status(200).json({ message: "Notifikasi berhasil diproses" });
//     } catch (error) {
//         console.error('Notification Error:', error);
//         return res.status(500).json({
//             message: "Terjadi kesalahan saat memproses notifikasi",
//             error: error.message
//         });
//     }
// };

const createPayment = async(req, res) => {
    try {
        const { order_id } = req.params;
        const currentUser = req.user;
        const { payment_method } = req.body;

        // Input validation
        if (!order_id) {
            return res.status(400).json({ message: "Order ID wajib diisi" });
        }

        if (!payment_method || !['COD', 'transfer'].includes(payment_method)) {
            return res.status(400).json({ message: "Metode pembayaran tidak valid" });
        }

        // Find order
        const order = await OrderModel.findOne({
            where: { id: order_id },
            include: [{ model: ShippingModel, as: 'shipping_cost' }]
        });

        if (!order) {
            return res.status(404).json({ message: "Order tidak ditemukan" });
        }

        // Calculate total amount
        const shippingCost = order.shipping_cost ? order.shipping_cost[0].shipping_cost || 0 : 0;
        const amount = parseFloat(order.total_price) + parseFloat(shippingCost);

        console.log("shipping cost", shippingCost);
        console.log("amount", amount);

        // Determine initial status based on payment method
        const initial_payment_status = payment_method === 'COD' ? 'completed' : 'pending';
        const initial_order_status = payment_method === 'COD' ? 'process' : 'pending';

        // Create initial order history
        await OrderHistoryModel.create({
            order_id,
            user_id: currentUser.id,
            status: initial_order_status,
            note: payment_method === 'COD' ?
                'Pembayaran COD - Bayar saat barang diterima' : 'Menunggu pembayaran transfer'
        });

        // Create payment record
        const payment = await PaymentModel.create({
            order_id,
            user_id: currentUser.id,
            payment_method,
            amount,
            payment_status: initial_payment_status,
            payment_date: new Date(),
            // midtrans_order_id: parameter.transaction_details.order_id
        });

        // Update order status
        await OrderModel.update({
            status: initial_order_status,
            payment_status: initial_payment_status
        }, { where: { id: order_id } });

        // Process based on payment method
        if (payment_method === 'transfer') {
            // Create Midtrans transaction
            const parameter = {
                transaction_details: {
                    order_id: `PAYMENT-${payment.id}`,
                    gross_amount: amount
                },
                credit_card: { secure: true },
                customer_details: {
                    first_name: currentUser.username,
                    email: currentUser.email,
                    phone: currentUser.phone_number
                },
                callbacks: {
                    finish: 'http://localhost:5174/orderhistories',
                    error: 'http://localhost:5174/payment'
                }
            };

            const midtransTransaction = await snap.createTransaction(parameter);

            // Update payment dengan midtrans_order_id dan token
            await payment.update({
                midtrans_order_id: parameter.transaction_details.order_id,
                midtrans_token: midtransTransaction.token
            });

            // Trigger Pusher for transfer payment notification
            pusher.trigger('payment-channel', 'payment-created', {
                order_id,
                payment_id: payment.id,
                amount,
                payment_url: midtransTransaction.redirect_url,
                message: 'Silakan lanjutkan pembayaran'
            });

            return res.status(201).json({
                message: "Silakan lanjutkan pembayaran",
                payment_url: midtransTransaction.redirect_url,
                payment_data: payment
            });
        } else {
            // Process COD - reduce stock immediately
            const orderItems = await OrderItemModel.findAll({
                where: { order_id }
            });

            for (const item of orderItems) {
                const product = await ProductModel.findByPk(item.product_id);
                if (product) {
                    if (product.stock < item.quantity) {
                        return res.status(400).json({
                            message: `Stok ${product.name} tidak mencukupi`
                        });
                    }
                    await product.update({
                        stock: product.stock - item.quantity,
                        total_sold: product.total_sold + item.quantity
                    });
                }
            }

            // Create success history for COD
            await OrderHistoryModel.create({
                order_id,
                user_id: currentUser.id,
                status: "process",
                note: 'Pembayaran COD Berhasil'
            });

            // Trigger Pusher for COD order
            pusher.trigger('order-channel', 'cod-order-created', {
                order_id,
                user_id: currentUser.id,
                payment_method: 'COD',
                amount,
                status: 'process',
                items: orderItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price
                }))
            });

            return res.status(201).json({
                message: "Pembayaran COD berhasil diproses",
                payment_data: payment
            });
        }
    } catch (error) {
        console.error('Payment Error:', error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat memproses pembayaran",
            error: error.message
        });
    }
};

const handleMidtransNotification = async(req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const notification = req.body;
        const midtransOrderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        console.log('notification', notification);
        console.log('midtransOrderId', midtransOrderId);
        console.log('transactionStatus', transactionStatus);
        console.log('fraudStatus', fraudStatus);


        // ✅ Now `crypto.createHash` will work
        const hashed = crypto.createHash('sha512')
            .update(`${midtransOrderId}${notification.status_code}${notification.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
            .digest('hex');


        if (hashed !== notification.signature_key) {
            await transaction.rollback();
            return res.status(401).json({ message: "Signature tidak valid" });
        }

        // Cari payment berdasarkan midtrans_order_id
        const payment = await PaymentModel.findOne({
            where: { midtrans_order_id: midtransOrderId },
            include: [{
                model: OrderModel,
                as: 'order',
                include: [{
                    model: ShippingModel,
                    as: 'shipping_cost'
                }]
            }],
            transaction
        });

        if (!payment) {
            await transaction.rollback();
            return res.status(404).json({ message: "Pembayaran tidak ditemukan" });
        }

        // Skip jika sudah completed
        if (payment.payment_status === 'completed') {
            await transaction.rollback();
            return res.status(200).json({ message: "Pembayaran sudah diproses sebelumnya" });
        }

        // Proses untuk transaksi yang berhasil
        if (transactionStatus === 'settlement' ||
            (transactionStatus === 'capture' && fraudStatus === 'accept')) {

            // Update payment status
            await payment.update({
                payment_status: 'completed',
                payment_date: new Date(),
                midtrans_response: JSON.stringify(notification)
            }, { transaction });

            // Update order status
            await OrderModel.update({
                status: 'process',
                payment_status: 'completed'
            }, {
                where: { id: payment.order_id },
                transaction
            });

            // Buat order history
            await OrderHistoryModel.create({
                order_id: payment.order_id,
                user_id: payment.user_id,
                status: "process",
                note: 'Pembayaran transfer berhasil diproses'
            }, { transaction });

            // Kurangi stok produk
            const orderItems = await OrderItemModel.findAll({
                where: { order_id: payment.order_id },
                transaction
            });

            for (const item of orderItems) {
                const product = await ProductModel.findByPk(item.product_id, { transaction });
                if (product) {
                    if (product.stock < item.quantity) {
                        throw new Error(`Stok ${product.name} tidak mencukupi`);
                    }
                    await product.update({
                        stock: product.stock - item.quantity,
                        total_sold: product.total_sold + item.quantity
                    }, { transaction });
                }
            }

            await transaction.commit();

            // Trigger update ke frontend via Pusher
            pusher.trigger('payment-channel', 'payment-completed', {
                order_id: payment.order_id,
                payment_id: payment.id,
                status: 'completed',
                timestamp: new Date()
            });

            return res.status(200).json({ message: "Pembayaran berhasil diproses" });
        }

        // Handle status lainnya (pending, deny, expire, cancel)
        if (['pending', 'deny', 'expire', 'cancel'].includes(transactionStatus)) {
            await payment.update({
                payment_status: transactionStatus,
                midtrans_response: JSON.stringify(notification)
            }, { transaction });

            await OrderModel.update({
                payment_status: transactionStatus
            }, {
                where: { id: payment.order_id },
                transaction
            });

            await transaction.commit();
            return res.status(200).json({ message: `Status pembayaran diperbarui: ${transactionStatus}` });
        }

        await transaction.commit();
        return res.status(200).json({ message: "Notifikasi berhasil diterima" });
    } catch (error) {
        await transaction.rollback();
        console.error('Payment Notification Error:', error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat memproses notifikasi",
            error: error.message
        });
    }
};

// const handleMidtransNotification = async(req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//         // ... (validasi signature dan proses notifikasi)
//         console.log('Incoming Midtrans notification:', req.body); // Logging

//         // Validasi body
//         if (!req.body || !req.body.order_id) {
//             await transaction.rollback();
//             return res.status(400).json({ message: "Invalid notification body" });
//         }
//         const notification = req.body;
//         const midtransOrderId = notification.order_id;
//         const transactionStatus = notification.transaction_status;
//         const fraudStatus = notification.fraud_status;

//         // Validasi signature key
//         const hashed = crypto.createHash('sha512')
//             .update(`${midtransOrderId}${notification.status_code}${notification.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
//             .digest('hex');

//         if (hashed !== notification.signature_key) {
//             await transaction.rollback();
//             return res.status(401).json({ message: "Signature tidak valid" });
//         }
//         if (transactionStatus === 'expire') {
//             // Handle transaksi kadaluarsa
//             await payment.update({ payment_status: 'expired' }, { transaction });
//         }

//         // Cari payment berdasarkan midtrans_order_id
//         const payment = await PaymentModel.findOne({
//             where: { midtrans_order_id: midtransOrderId },
//             include: [{
//                 model: OrderModel,
//                 as: 'order',
//                 include: [{
//                     model: ShippingModel,
//                     as: 'shipping_cost'
//                 }]
//             }],
//             transaction
//         });

//         if (!payment) {
//             await transaction.rollback();
//             return res.status(404).json({ message: "Pembayaran tidak ditemukan" });
//         }

//         // Skip jika sudah completed
//         if (payment.payment_status === 'completed') {
//             await transaction.rollback();
//             return res.status(200).json({ message: "Pembayaran sudah diproses sebelumnya" });
//         }

//         // Proses untuk transaksi yang berhasil
//         if (transactionStatus === 'settlement' ||
//             (transactionStatus === 'capture' && fraudStatus === 'accept')) {

//             // Update payment status
//             await payment.update({
//                 payment_status: 'completed',
//                 payment_date: new Date(),
//                 midtrans_response: JSON.stringify(notification)
//             }, { transaction });

//             // Update order status
//             await OrderModel.update({
//                 status: 'process',
//                 payment_status: 'completed'
//             }, {
//                 where: { id: payment.order_id },
//                 transaction
//             });

//             // Create order history
//             await OrderHistoryModel.create({
//                 order_id: payment.order_id,
//                 user_id: payment.user_id,
//                 status: "process",
//                 note: 'Pembayaran transfer berhasil diproses'
//             }, { transaction });

//             // Kurangi stok produk
//             const orderItems = await OrderItemModel.findAll({
//                 where: { order_id: payment.order_id },
//                 transaction
//             });

//             for (const item of orderItems) {
//                 const product = await ProductModel.findByPk(item.product_id, { transaction });
//                 if (product) {
//                     await product.update({
//                         stock: product.stock - item.quantity,
//                         total_sold: product.total_sold + item.quantity
//                     }, { transaction });
//                 }
//             }

//             await transaction.commit();

//             // Trigger event ke frontend
//             pusher.trigger('payment-channel', 'payment-completed', {
//                 order_id: payment.order_id,
//                 payment_id: payment.id,
//                 status: 'completed',
//                 timestamp: new Date()
//             });

//             return res.status(200).json({ message: "Pembayaran berhasil diproses" });
//         }

//         // ... (handle status lainnya)
//         // Handle status lainnya (pending, deny, expire, cancel)
//         if (['pending', 'deny', 'expire', 'cancel'].includes(transactionStatus)) {
//             await payment.update({
//                 payment_status: transactionStatus,
//                 midtrans_response: JSON.stringify(notification)
//             }, { transaction });

//             await OrderModel.update({
//                 payment_status: transactionStatus
//             }, {
//                 where: { id: payment.order_id },
//                 transaction
//             });

//             await transaction.commit();
//             return res.status(200).json({ message: `Status pembayaran diperbarui: ${transactionStatus}` });
//         }

//         await transaction.commit();
//         return res.status(200).json({ message: "Notifikasi berhasil diterima" });
//     } catch (error) {
//         await transaction.rollback();
//         console.error('Error:', error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };

const updateStatus = async(req, res, _next) => {
    try {
        const currentUser = req.user;
        const { order_id } = req.params;
        const { payment_status } = req.body;


        // Memastikan productId tidak undefined
        if (!order_id) {
            return res.status(400).send({ message: "Product ID tidak ditemukan" });
        }

        // Cari Order berdasarkan productId
        const payment = await PaymentModel.findOne({
            where: {
                order_id,
                user_id: currentUser.id,
            },
        });

        if (!payment) {
            return res.status(404).send({ message: "Payment tidak ditemukan atau Anda tidak memiliki izin untuk memperbaruinya" });
        }

        // Memvalidasi inputan dari user
        if (!payment_status) {
            return res.status(400).send({ message: "Tidak ada data yang diperbarui" });
        }

        // Update produk
        const updatedPayment = await payment.update({
            payment_status,
            payment_date: new Date(),
        });

        if (payment_status == 'failed') {
            await OrderModel.update({
                status: 'cancelled',
            }, {
                where: {
                    id: order_id,
                },
            });
        }
        await OrderModel.update({
            payment_status: payment_status,
        }, {
            where: {
                id: order_id,
            },
        });

        return res.send({
            message: "Order updated successfully",
            data: updatedPayment,
        });
    } catch (error) {
        console.error("Error:", error.message); // Hanya untuk debugging
        return res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = { index, updateStatus, createPayment, handleMidtransNotification };