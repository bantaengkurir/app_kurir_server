const {
    payment: PaymentModel,
    order: OrderModel,
    shipping_cost: ShippingModel,
    orderitem: OrderItemModel,
    product: ProductModel,
    variant: VariantModel,
    order_historie: OrderHistoryModel,
    user: UserModel,
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

        //! Find order
        const order = await OrderModel.findOne({
            where: { id: order_id },
            include: [{ model: ShippingModel, as: 'shipping_cost' }]
        });

        // console.log(" iiiiiiiini orderrr", order)

        // const order = await OrderModel.findOne({
        //     where: { id: order_id },
        //     include: [{
        //             model: ShippingModel,
        //             as: 'shipping_cost'
        //         },
        //         {
        //             model: UserModel, // Asumsikan ada model Courier
        //             as: 'courier',
        //             attributes: ['id'] // Ambil ID kurir
        //         }
        //     ]
        // });

        // // Dapatkan ID kurir jika ada
        // const courier_id = order.courier ? order.courier.id : null;

        if (!order) {
            return res.status(404).json({ message: "Order tidak ditemukan" });
        }

        // Calculate total amount
        const shippingCost = order.shipping_cost ? order.shipping_cost[0].shipping_cost || 0 : 0;
        const amount = parseFloat(order.total_price) + parseFloat(shippingCost);


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
            payment_method,
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
                    finish: 'http://localhost:3000/orderhistories',
                    error: 'http://localhost:3000/payment'
                }
            };

            const midtransTransaction = await snap.createTransaction(parameter);

            // Update payment dengan midtrans_order_id dan token
            await payment.update({
                midtrans_order_id: parameter.transaction_details.order_id,
                midtrans_token: midtransTransaction.token
            });


            return res.status(201).json({
                message: "Silakan lanjutkan pembayaran",
                payment_url: midtransTransaction.redirect_url,
                payment_data: payment
            });
        } else {


            // PROSES COD - KURANGI STOK
            const orderItems = await OrderItemModel.findAll({
                where: { order_id },
                include: [{
                    model: VariantModel,
                    as: 'variant',
                    include: [{
                        model: ProductModel,
                        as: 'product'
                    }]
                }]
            });

            // Gunakan transaction untuk COD juga
            const codTransaction = await sequelize.transaction();

            try {
                for (const item of orderItems) {
                    if (!item.variant) continue;

                    // Method 1: Gunakan decrement
                    await VariantModel.decrement('stock', {
                        by: item.quantity,
                        where: { id: item.variant.id },
                        transaction: codTransaction
                    });

                    // Jika perlu update product juga
                    if (item.variant.product) {
                        await ProductModel.decrement('stock', {
                            by: item.quantity,
                            where: { id: item.variant.product.id },
                            transaction: codTransaction
                        });

                        await ProductModel.increment('total_sold', {
                            by: item.quantity,
                            where: { id: item.variant.product.id },
                            transaction: codTransaction
                        });
                    }
                }

                await codTransaction.commit();
            } catch (error) {
                await codTransaction.rollback();
                console.error('Gagal update stok COD:', error);
                return res.status(500).json({ message: "Gagal update stok" });
            }


            // Prepare items data for Pusher
            const pusherItems = orderItems.map(item => ({
                product_id: item.variant && item.variant.product ? item.variant.product.id : null,
                name: item.variant && item.variant.product ? item.variant.product.name : null,
                product_description: item.variant && item.variant.product ? item.variant.product.description : null,
                image_url: item.variant && item.variant.product ? item.variant.product.image_url : null,
                seller_id: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.id : null,
                seller_name: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.name : null,
                seller_address: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.address : null,
                seller_profile_image: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.profile_image : null,
                seller_latitude: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.latitude : null,
                seller_longitude: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.longitude : null,
                variant_id: item.variant ? item.variant.id : null,
                variant_name: item.variant ? item.variant.name : null,
                price: item.price,
                quantity: item.quantity
            }));
            // Get shipping info
            const shippingInfo = order.shipping_cost[0];

            const pusherData = {
                order_id: order.id,
                user_id: currentUser.id,
                customer_name: currentUser.username,
                payment_method: 'COD',
                amount: amount,
                status: 'process',
                order_date: new Date(),
                shipping_cost: shippingInfo.shipping_cost,
                distance: shippingInfo.distance,
                address: shippingInfo.address,
                items: pusherItems
            };

            // Kirim ke admin
            pusher.trigger('admin-channel', 'new-order', pusherData);

            // Kirim ke kurir spesifik jika ada
            if (order.courier_id) {
                const pusherData = {
                    order_id: order.id,
                    customer_name: currentUser.username,
                    amount: amount,
                    payment_method: 'COD',
                    status: 'process',
                    order_date: new Date().toISOString(),
                    shipping_cost: shippingInfo.shipping_cost,
                    distance: shippingInfo.distance,
                    address: shippingInfo.address,
                    // Hanya kirim data penting
                    items: pusherItems.map(item => ({
                        product_name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    }))
                };

                pusher.trigger(`courier-${order.courier_id}`, 'new-order', pusherData);
            }





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

        // 1. Validasi Signature Key
        const hashed = crypto
            .createHash('sha512')
            .update(
                `${midtransOrderId}${notification.status_code}${notification.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`
            )
            .digest('hex');

        if (hashed !== notification.signature_key) {
            await transaction.rollback();
            return res.status(401).json({ message: "Signature tidak valid" });
        }

        // 2. Cari Payment dan Order terkait
        const payment = await PaymentModel.findOne({
            where: { midtrans_order_id: midtransOrderId },
            include: [{
                model: OrderModel,
                as: 'order',
                include: [{
                        model: ShippingModel,
                        as: 'shipping_cost',
                        // attributes: ['address']
                    },
                    {
                        model: UserModel,
                        as: 'user',
                        // attributes: ['name', 'email', 'phone_number']
                    },
                    {
                        model: UserModel,
                        as: 'couriers',
                        attributes: ['id']
                    }
                ]
            }],
            transaction
        });

        if (!payment) {
            await transaction.rollback();
            return res.status(404).json({ message: "Pembayaran tidak ditemukan" });
        }

        // 3. Skip jika sudah completed
        if (payment.payment_status === 'completed') {
            await transaction.rollback();
            return res.status(200).json({ message: "Pembayaran sudah diproses sebelumnya" });
        }

        // 4. Handle Berbagai Status Transaksi
        // 4.1 Pembayaran Berhasil
        if (
            transactionStatus === 'settlement' ||
            (transactionStatus === 'capture' && fraudStatus === 'accept')
        ) {
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
                status: 'process',
                note: 'Pembayaran transfer berhasil diproses'
            }, { transaction });

            // Kurangi stok produk
            const orderItems = await OrderItemModel.findAll({
                where: { order_id: payment.order_id },
                include: [{
                    model: VariantModel,
                    as: 'variant',
                    include: [{
                        model: ProductModel,
                        as: 'product'
                    }]
                }],
                transaction
            });

            for (const item of orderItems) {
                if (item.variant) {
                    // Kurangi stok variant
                    await VariantModel.update({
                        stock: item.variant.stock - item.quantity,
                        total_sold: item.variant.total_sold + item.quantity
                    }, {
                        where: { id: item.variant.id },
                        transaction
                    });

                    // Kurangi stok produk
                    if (item.variant.product) {
                        await ProductModel.update({
                            stock: item.variant.product.stock - item.quantity,
                            total_sold: item.variant.product.total_sold + item.quantity
                        }, {
                            where: { id: item.variant.product.id },
                            transaction
                        });
                    }
                }
            }

            // Commit transaksi database
            await transaction.commit();

            // 5. Kirim Notifikasi ke Courier dan Admin
            const courierId = payment.order.courier_id;

            // Data untuk notifikasi
            const notificationData = {
                order_id: payment.order_id,
                payment_id: payment.id,
                status: 'completed',
                timestamp: new Date(),
                customer_name: payment.order && payment.order.user ? payment.order.user.name : null,
                midtrans_order_id: payment.midtrans_order_id,
                amount: payment.amount,
                customer_address: payment.order && payment.order.user ? payment.order.user.address : null,
                distance: payment.order && payment.order.shipping_cost ? payment.order.shipping_cost[0].distance : null,
                items: orderItems
            };


            // 5.1 Kirim ke Admin
            pusher.trigger('admin-channel', 'new-order', notificationData);

            // 5.2 Kirim ke Courier jika ada
            if (courierId) {
                try {
                    // pusher.trigger(`courier-${courierId}`, 'order-update', {
                    //     ...notificationData,
                    //     message: 'Pembayaran telah diterima, siapkan pengiriman'
                    // });
                    pusher.trigger(`courier-${courierId}`, 'new-order', notificationData);
                    console.log(`Notifikasi dikirim ke kurir ${courierId}`);
                } catch (pusherError) {
                    console.error('Gagal mengirim notifikasi ke kurir:', pusherError);
                }
            } else {
                console.log('Order belum memiliki kurir yang ditugaskan');
            }

            // 5.3 Kirim ke Customer
            pusher.trigger(`user-${payment.user_id}`, 'payment-update', {
                status: 'completed',
                message: 'Pembayaran berhasil diproses'
            });

            return res.status(200).json({ message: "Pembayaran berhasil diproses" });
        }

        // 4.2 Handle Status Lainnya (pending, deny, expire, cancel)
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

            // Kirim notifikasi status pembayaran
            const notificationData = {
                order_id: payment.order_id,
                status: transactionStatus,
                message: `Status pembayaran: ${transactionStatus}`
            };

            // Ke Admin
            pusher.trigger('admin-channel', 'payment-update', notificationData);

            // Ke Customer
            pusher.trigger(`user-${payment.user_id}`, 'payment-update', notificationData);

            // Ke Courier jika ada
            if (payment.order.courier_id) {
                pusher.trigger(
                    `courier-${payment.order.courier_id}`,
                    'payment-update',
                    notificationData
                );
            }

            return res.status(200).json({
                message: `Status pembayaran diperbarui: ${transactionStatus}`
            });
        }

        // 4.3 Status Tidak Dikenali
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