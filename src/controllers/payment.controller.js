const {
    payment: PaymentModel,
    order: OrderModel,
    shipping_cost: ShippingModel,
    orderitem: OrderItemModel,
    product: ProductModel,
    order_historie: OrderHistoryModel,
} = require("../models");
const { saveOrderHistory } = require("../middlewares/order_history.helper");

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

// const createPayment = async(req, res) => {
//     try {
//         const { order_id } = req.params; // Ambil order_id dari params
//         const { payment_method } = req.body; // Ambil payment_method dari body

//         // Validasi input
//         if (!order_id) {
//             return res.status(400).send({ message: "order_id wajib diisi di URL params" });
//         }

//         if (!payment_method) {
//             return res.status(400).send({ message: "payment_method wajib diisi di body" });
//         }

//         // Validasi metode pembayaran
//         const validPaymentMethods = ["COD", "transfer"];
//         if (!validPaymentMethods.includes(payment_method)) {
//             return res.status(400).send({ message: "Metode pembayaran tidak valid" });
//         }

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

//         console.log("cost", cost);

//         // let payment_status = "pending"; // Nilai default
//         if (payment_method == "COD") {
//             payment_status = "completed";
//         } else if (payment_method == "transfer") {
//             payment_status = "process";
//         }


//         if (order_id == order.order_id || order.status == 'process' || order.status == 'completed') {
//             return res.status(403).send({ message: `pembayaran dalam keadaan ${order.status}` });
//         } else if (order.status == 'cancelled' || order.status == 'failed') {
//             return res.status(403).send({ message: `pembayaran dalam keadaan ${order.status}` });
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

//         await OrderModel.update({
//             status: "process",
//             payment_status: payment_status,
//         }, {
//             where: {
//                 id: order_id,
//             },
//         });

//         return res.status(201).send({
//             message: "Pembayaran berhasil dibuat",
//             data: payment,
//         });
//     } catch (error) {
//         console.error("Error:", error.message);
//         return res.status(500).send({ message: "Internal Server Error" });
//     }
// };

const createPayment = async(req, res) => {
    try {
        const { order_id } = req.params; // Ambil order_id dari params
        const currentUser = req.user.id;
        const { payment_method } = req.body; // Ambil payment_method dari body

        // Validasi input
        if (!order_id) {
            return res.status(400).send({ message: "order_id wajib diisi di URL params" });
        }

        if (!payment_method) {
            return res.status(400).send({ message: "payment_method wajib diisi di body" });
        }

        // Validasi metode pembayaran
        const validPaymentMethods = ["COD", "transfer"];
        if (!validPaymentMethods.includes(payment_method)) {
            return res.status(400).send({ message: "Metode pembayaran tidak valid" });
        }

        // Cari order berdasarkan order_id
        const order = await OrderModel.findOne({
            where: { id: order_id },
            include: [{ model: ShippingModel, as: "shipping_cost" }],
        });

        if (!order) {
            return res.status(404).send({ message: "Order tidak ditemukan" });
        }

        // Hitung total amount
        const cost = order.shipping_cost ? order.shipping_cost[0].shipping_cost || 0 : 0;
        const amount = parseFloat(order.total_price) + parseFloat(cost);

        console.log("cost", cost);

        let payment_status = "pending"; // Nilai default
        if (payment_method == "COD") {
            payment_status = "process";
        } else if (payment_method == "transfer") {
            payment_status = "process";
        }

        // if (order_id) {
        //     return res.status(403).send({ message: `pembayaran dalam keadaan ${payment_status}` });
        // } else if (order.status == 'cancelled' || order.status == 'failed') {
        //     return res.status(403).send({ message: `pembayaran dalam keadaan ${payment_status}` });
        // }

        if (payment_method == 'COD') {


            await OrderHistoryModel.create({
                order_id,
                user_id: currentUser,
                status: payment_status,
                note: `Lakukan pembayaran setelah barang diterima`,
            });
        } else {
            await OrderHistoryModel.create({
                order_id,
                user_id: currentUser,
                status: payment_status,
                note: `Pembayaran dalam keadaan ${payment_status}`,
            });
        }

        // Buat data pembayaran
        const payment = await PaymentModel.create({
            order_id,
            user_id: order.user_id,
            courier_id: order.courier_id,
            payment_method,
            amount,
            payment_status: payment_status,
            payment_date: new Date(),
        });

        // Update status order
        await OrderModel.update({
            status: "process",
            payment_status: payment_status,
        }, {
            where: {
                id: order_id,
            },
        });

        // Proses update produk jika pembayaran berhasil
        if (payment_status === "process" || payment_status === "completed") {
            // Ambil semua item dari order
            const orderItems = await OrderItemModel.findAll({
                where: { order_id: order.id },
            });

            // Update stok dan sold untuk setiap produk
            for (let item of orderItems) {
                const product = await ProductModel.findOne({
                    where: { id: item.product_id },
                });

                if (product) {
                    // Pastikan ada cukup stok untuk mengurangi
                    if (product.stock >= item.quantity) {
                        // Kurangi stok dan tambahkan jumlah sold
                        await ProductModel.update({
                            stock: product.stock - item.quantity,
                            total_sold: product.total_sold + item.quantity,
                        }, {
                            where: { id: product.id },
                        });
                    } else {
                        return res.status(400).send({ message: `Stok produk ${product.name} tidak cukup` });
                    }
                }
            }
        }

        // Catat riwayat pembayaran
        // await saveOrderHistory(order_id, req.user.id, payment_status, `Pembayaran dalam keadaan ${payment_status}`);



        return res.status(201).send({
            message: "Pembayaran berhasil dibuat",
            data: payment,
        });
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).send({ message: "Internal Server Error" });
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


module.exports = { index, updateStatus, createPayment };