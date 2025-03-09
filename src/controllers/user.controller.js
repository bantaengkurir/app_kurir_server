const { user: UserModel, order: OrderModel, shipping_cost: ShippingModel, payment: PaymentModel, courier_earning: Courer_earningModel } = require("../models");


/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */

const indexSallery = async(req, res, next) => {
    // Pastikan req.user.id ada
    if (!req.user || !req.user.id) {
        return res.status(400).send({ message: "User not authenticated" });
    }


    try {
        const sallerys = await OrderModel.findAll({
            where: {
                courier_id: req.user.id,
                status: "completed"
            },
            include: [{
                    model: UserModel,
                    as: "user",


                },
                {
                    model: ShippingModel,
                    as: "shipping_cost",


                },
                {
                    model: PaymentModel,
                    as: "payment",


                },
            ]
        });

        // Pastikan data ditemukan
        if (!sallerys || sallerys.length === 0) {
            return res.status(404).send({ message: "User not found" });
        }

        // const newSallery = await

        const formattedSallery = sallerys.map((sallery) => {
            return {
                order_id: sallery.id,
                user_id: sallery.user_id,
                status_order: sallery.status,
                payment_method: sallery.payment_method,
                payment_status: sallery.payment_status,
                order_code: sallery.order_code,
                order_date: sallery.order_date,
                total_price: sallery.total_price,
                shipping_cost: sallery.shipping_cost[0].shipping_cost,
            }
        })

        return res.send({
            message: "success",
            data: formattedSallery,
        });

    } catch (error) {
        console.error("Error : ", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */

const show = async(req, res, next) => {
    try {
        const { id } = req.params;

        const user = await UserModel.findByPk(id, {
            // attributes: ["id", "name", "description", "price", "stock", "image_url"],
            // include: [{
            //     model: CategoryModel,
            //     as: "category",
            // }],
        });

        if (!user) {
            return res.status(404).send({
                message: "User tidak ditemukan",
                data: null
            })
        }

        return res.send({
            message: "success",
            data: user,
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
}



module.exports = {
    indexSallery,
    show,
};