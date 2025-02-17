const { user: UserModel } = require("../models");

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

module.exports = { show };