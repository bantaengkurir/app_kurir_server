const { user: UserModel, product: ProductModel, courier_rating: CourierRatingModel, review: ReviewModel, order: OrderModel } = require("../models");

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
                    model: ProductModel,
                    as: "product",
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
        const { order_id, product_id, rating, comment } = req.body;

        if (!order_id) {
            return res.status(400).send({ message: "Permintaan tidak valid, pastikan semua data diisi" });
        }

        const newRating = await ReviewModel.create({
            user_id: currentUser.id,
            order_id,
            product_id,
            rating,
            comment
        });

        console.log("New rating:", newRating);

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

        console.log("New rating:", newRating);

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



module.exports = { indexProduct, indexCourier, createRatProduct, createRatCourier };