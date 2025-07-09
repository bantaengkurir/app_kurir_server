const midtransClient = require("midtrans-client");
const { courier_earning: Courier_earningModel, user: UserModel } = require("../models");

let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: "SB-Mid-server-t2OpglXq5gsZp_1BlSlfiamo",
    clientKey: "SB-Mid-client-7-zhKMrkvYRGbMxq",
});

// const createTransaction = async(req, res) => {
//     console.log("Request Body:", req.body); // Tambahkan ini untuk debugging
//     const { orderId, totalEarnings } = req.body;

//     if (!orderId || !totalEarnings) {
//         return res.status(400).send({
//             message: "Bad Request",
//             error: "orderId and totalEarnings are required",
//         });
//     }

//     // Pastikan totalEarnings adalah angka
//     const grossAmount = parseFloat(totalEarnings);
//     if (isNaN(grossAmount)) {
//         return res.status(400).send({
//             message: "Bad Request",
//             error: "totalEarnings must be a number",
//         });
//     }

//     try {
//         let parameter = {
//             transaction_details: {
//                 order_id: orderId, // Gunakan order_id dari data earning
//                 gross_amount: grossAmount, // Pastikan gross_amount adalah angka
//             },
//             credit_card: {
//                 secure: true,
//             },
//             customer_details: {
//                 first_name: "budi",
//                 email: "ismailbary2@gmail.com",
//                 phone: "085342545607"
//             }
//         };

//         const transaction = await snap.createTransaction(parameter);
//         res.send({
//             message: "Success",
//             data: transaction,
//         });
//     } catch (error) {
//         console.error("Error creating transaction:", error);
//         res.status(500).send({
//             message: "Internal Server Error",
//             error: error.message,
//         });
//     }
// };

const createTransaction = async(req, res) => {
    // console.log("Request Body:", req.body); // Debugging
    const { orderId, totalEarnings } = req.body;

    const currentUser = req.user;

    // console.log("ini user yang akan diambil", currentUser)

    // Validasi input
    if (!orderId || !totalEarnings) {
        return res.status(400).send({
            message: "Bad Request",
            error: "orderId and totalEarnings are required",
        });
    }

    // Pastikan totalEarnings adalah angka
    const grossAmount = parseInt(totalEarnings, 10); // Konversi ke integer
    if (isNaN(grossAmount)) {
        return res.status(400).send({
            message: "Bad Request",
            error: "totalEarnings must be a number",
        });
    }

    // Pastikan grossAmount adalah integer (tidak mengandung desimal)
    if (!Number.isInteger(grossAmount)) {
        return res.status(400).send({
            message: "Bad Request",
            error: "totalEarnings must be an integer (no decimals allowed for IDR)",
        });
    }

    try {
        let parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: grossAmount, // Pastikan gross_amount adalah integer
            },
            credit_card: {
                secure: true,
            },
            customer_details: {
                first_name: currentUser.username,
                email: currentUser.email,
                phone: currentUser.phone_number
            },
            callbacks: {
                finish: "http://localhost:5173/courier&sallery", // URL setelah pembayaran berhasil
                error: "https://example.com/error", // URL jika pembayaran gagal
                pending: "https://example.com/pending", // URL jika pembayaran pending
            },
        };

        // console.log("parameter", parameter)

        const transaction = await snap.createTransaction(parameter);
        res.send({
            message: "Success",
            data: transaction,
        });
    } catch (error) {
        console.error("Error creating transaction:", error);
        if (error.message.includes("transaction_details.order_id has already been taken")) {
            return res.status(400).send({
                message: "Bad Request",
                error: "Order ID sudah digunakan. Silakan gunakan Order ID yang berbeda atau pembayaran telah dilakukan.",
            });
        }
        res.status(500).send({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


const handleNotification = (req, res) => {
    const notificationJson = req.body;

    snap.transaction.notification(notificationJson)
        .then((statusResponse) => {
            const orderId = statusResponse.order_id;
            const transactionStatus = statusResponse.transaction_status;
            const fraudStatus = statusResponse.fraud_status;

            // console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

            // Proses notifikasi sesuai kebutuhan Anda
            if (transactionStatus === "capture" && fraudStatus === "accept") {
                // Lakukan aksi ketika pembayaran berhasil
            } else if (transactionStatus === "settlement") {
                // Lakukan aksi ketika pembayaran berhasil
            } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
                // Lakukan aksi ketika pembayaran gagal
            } else if (transactionStatus === "pending") {
                // Lakukan aksi ketika pembayaran pending
            }

            res.status(200).send("OK");
        })
        .catch((error) => {
            console.error("Error handling notification:", error);
            res.status(500).send("Internal Server Error");
        });
};

module.exports = { createTransaction, handleNotification };