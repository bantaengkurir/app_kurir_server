const { order_historie: OrderHistoryModel } = require("../models/order_historie");

const saveOrderHistory = async(orderId, userId, status, note) => {
    try {
        // Validasi parameter
        if (!orderId || !userId || !status) {
            throw new Error("Missing required parameters: orderId, userId, or status");
        }

        // Simpan ke tabel order_histories
        await OrderHistoryModel.create({
            order_id: orderId,
            user_id: userId,
            status: status,
            note: note,
        });
    } catch (error) {
        console.error("Error saving order history:", error.message);
        // Lempar error agar bisa ditangani di level yang lebih tinggi
        throw new Error("Failed to save order history");
    }
};

module.exports = {
    saveOrderHistory,
};