const { user: UserModel, variant: VariantModel, product: ProductModel, courier_rating: CourierRatingModel, review: ReviewModel, order: OrderModel } = require("../models");

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */

const indexProduct = async(req, res, _next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).send({ message: "Unauthorized: User not logged in" });
        }

        let ratings;
        //     // Jika user adalah customer, tampilkan semua produk
        ratings = await ReviewModel.findAll({
            where: {
                user_id: req.user.id,
            },
            include: [{
                    model: OrderModel,
                    as: "order",
                },
                {
                    model: UserModel,
                    as: "user",
                },
                {
                    model: VariantModel,
                    as: "variant",
                }
            ],
        });

        return res.send({
            message: "Success",
            data: ratings,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};
/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */

const indexCourier = async(req, res, _next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).send({ message: "Unauthorized: User not logged in" });
        }

        let ratings;
        //     // Jika user adalah customer, tampilkan semua produk
        ratings = await CourierRatingModel.findAll({
            where: {
                user_id: req.user.id,
            },
            include: [{
                    model: OrderModel,
                    as: "order",
                },
                {
                    model: UserModel,
                    as: "user",
                },
                {
                    model: UserModel,
                    as: "courier",
                }
            ],
        });

        return res.send({
            message: "Success",
            data: ratings,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};


/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */


const createRatProduct = async(req, res, _next) => {

    try {

        const currentUser = req.user;
        const { order_id, variant_id, rating, comment } = req.body;

        if (!order_id) {
            return res.status(400).send({ message: "Permintaan tidak valid, pastikan semua data diisi" });
        }

        const newRating = await ReviewModel.create({
            user_id: currentUser.id,
            order_id,
            variant_id,
            rating,
            comment
        });


        return res.send({
            message: "rating created successfully",
            data: newRating,
        });
    } catch (error) {
        // Error lainnya
        console.error("Error:", error.message); // Hanya untuk debugging
        return res.status(500).json({ message: "Internal server error" });

    }
};
const createRatCourier = async(req, res, _next) => {

    try {
        const currentUser = req.user;
        const { order_id, courier_id, rating, review } = req.body;


        const newRating = await CourierRatingModel.create({
            order_id,
            user_id: currentUser.id,
            courier_id,
            rating,
            review,
            rating_time: new Date()
        });


        return res.send({
            message: "rating created successfully",
            data: newRating,
        });
    } catch (error) {
        // Error lainnya
        console.error("Error:", error.message); // Hanya untuk debugging
        return res.status(500).json({ message: "Internal server error" });

    }
};

const updateRatProduct = async(req, res, _next) => {
    try {
        const currentUser = req.user.id;
        const { order_id, variant_id, rating, comment } = req.body;


        // Memastikan produk milik seller yang sedang login
        const productRating = await ReviewModel.findOne({
            where: {
                order_id,
                variant_id,
                user_id: currentUser
            },
        });

        if (!productRating) {
            return res.status(404).send({ message: "Produk tidak ditemukan atau Anda tidak memiliki izin untuk memperbaruinya" });
        }

        // Memvalidasi inputan dari user
        if (!rating || !comment) {
            return res.status(400).send({ message: "Tidak ada data yang diperbarui" });
        }

        // Update produk
        const updatedRatProduct = await productRating.update({
            order_id,
            variant_id,
            rating,
            comment
        });

        return res.send({
            message: "Product updated successfully",
            data: updatedRatProduct,
        });
    } catch (error) {

        console.error("Error:", error.message); // Hanya untuk debugging
        return res.status(500).json({ message: "Internal server error" });

    }
};

const updateRatCourier = async(req, res, _next) => {
    try {
        const currentUser = req.user.id;
        const { order_id, courier_id, rating, review } = req.body;


        // Memastikan produk milik seller yang sedang login
        const courierRating = await CourierRatingModel.findOne({
            where: {
                order_id,
                courier_id,
                user_id: currentUser
            },
        });

        if (!courierRating) {
            return res.status(404).send({ message: "Produk tidak ditemukan atau Anda tidak memiliki izin untuk memperbaruinya" });
        }

        // Memvalidasi inputan dari user
        if (!rating || !review) {
            return res.status(400).send({ message: "Tidak ada data yang diperbarui" });
        }

        // Update produk
        const updatedRatCourier = await courierRating.update({
            order_id,
            courier_id,
            rating,
            review
        });

        return res.send({
            message: "Courier updated successfully",
            data: updatedRatCourier,
        });
    } catch (error) {

        console.error("Error:", error.message); // Hanya untuk debugging
        return res.status(500).json({ message: "Internal server error" });

    }
};


module.exports = { indexProduct, indexCourier, createRatProduct, createRatCourier, updateRatProduct, updateRatCourier };