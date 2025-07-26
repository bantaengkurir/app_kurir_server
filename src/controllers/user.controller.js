const { where } = require("sequelize");
const { user: UserModel, product: ProductModel, order: OrderModel, shipping_cost: ShippingModel, payment: PaymentModel, courier_earning: Courier_earningModel, courier: CourierModel } = require("../models");


/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */

// const indexUser = async(req, res, next) => {
//     try {
//         // Cek apakah user yang sedang login adalah admin
//         if (req.user.role !== "admin") {
//             return res.status(403).send({
//                 message: "Forbidden: You are not allowed to access this resource.",
//             });
//         }

//         const users = await UserModel.findAll({
//             attributes: ["id", "name", "email", "address", "phone_number", "profile_image", "role", "gender", "status", "is_verified", "created_at"],
//         });

//         return res.send({
//             message: "success",
//             data: users,
//         });

//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).send({ message: "Internal Server Error" });
//     }
// }

const indexUser = async(req, res, next) => {
    try {
        // Cek apakah user yang sedang login adalah admin
        if (req.user.role !== "admin") {
            return res.status(403).send({
                message: "Forbidden: You are not allowed to access this resource.",
            });
        }

        // Pertama ambil semua user dengan data dasar
        const users = await UserModel.findAll({
            attributes: ["id", "name", "email", "address", "phone_number",
                "profile_image", "role", "gender", "status", "is_verified", "verification_code", "created_at"
            ],
        });
        // Kemudian untuk setiap user, ambil asosiasi berdasarkan role
        const usersWithAssociations = await Promise.all(users.map(async(user) => {
            const userJson = user.toJSON();

            switch (user.role) {
                case 'customer':
                    userJson.orders = await OrderModel.findAll({
                        where: { user_id: user.id }
                    });
                    break;
                case 'seller':
                    userJson.products = await ProductModel.findAll({
                        where: { seller_id: user.id }
                    });
                    break;
                case 'courier':
                    userJson.courier = await CourierModel.findOne({
                        where: { courier_id: user.id },
                    });
                    userJson.orders = await OrderModel.findAll({
                        where: { courier_id: user.id }
                    });
                    break;
            }

            return userJson;
        }));

        return res.send({
            message: "success",
            data: usersWithAssociations,
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
}

const indexCourier = async(req, res, next) => {
    try {
        // Cek apakah user yang sedang login adalah admin
        if (req.user.role !== "admin") {
            return res.status(403).send({
                message: "Forbidden: You are not allowed to access this resource.",
            });
        }

        const couriers = await UserModel.findAll({
            attributes: ["id", "name", "email", "address", "phone_number", "profile_image", "role", "gender", "status", "is_verified", "created_at"],
            where: {
                role: "courier"
            },
            include: [{
                model: CourierModel,
                as: "courier",
            }],
        });

        return res.send({
            message: "success",
            data: couriers,
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
}

const indexSeller = async(req, res, next) => {
    try {
        // Cek apakah user yang sedang login adalah admin
        if (req.user.role !== "admin") {
            return res.status(403).send({
                message: "Forbidden: You are not allowed to access this resource.",
            });
        }

        const sellers = await UserModel.findAll({
            attributes: ["id", "name", "email", "address", "phone_number", "profile_image", "role", "gender", "status", "is_verified", "created_at"],
            where: {
                role: "seller"
            },
            include: [{
                model: ProductModel,
                as: "product",
            }],
        });

        return res.send({
            message: "success",
            data: sellers,
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
}




/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */

const showUsers = async(req, res, next) => {
    try {
        const { id } = req.params;

        if (req.user.role !== "admin") {
            return res.status(403).send({
                message: "Forbidden: You are not allowed to access this resource.",
            });
        }

        // Cari user tanpa include untuk menentukan role
        const user = await UserModel.findByPk(id, {
            attributes: ["id", "role"]
        });

        if (!user) {
            return res.status(404).send({
                message: "User tidak ditemukan",
                data: null
            });
        }

        // Tentukan include berdasarkan role user
        let includeModels;
        switch (user.role) {
            case 'customer':
                includeModels = [{ model: OrderModel, as: "order" }];
                break;
            case 'seller':
                includeModels = [{ model: ProductModel, as: "product" }];
                break;
            case 'courier':
                includeModels = [
                    { model: CourierModel, as: "courier" },
                    { model: OrderModel, as: "orders" }
                ];
                break;
            default:
                return res.status(403).send({
                    message: "Forbidden: User role tidak valid",
                });
        }

        // Ambil data lengkap user dengan include yang sesuai
        const fullUser = await UserModel.findByPk(id, {
            attributes: ["id", "name", "email", "address", "phone_number",
                "profile_image", "role", "status", "is_verified", "createdAt"
            ],
            include: includeModels
        });

        return res.send({
            message: "success",
            data: fullUser,
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
const showCourier = async(req, res, next) => {
    try {
        const userId = req.user.id; // Ambil dari token JWT (validateToken)

        const courier = await CourierModel.findOne({
            where: { courier_id: userId }
        });

        if (!courier) {
            return res.status(404).send({
                message: "Courier tidak ditemukan",
                data: null
            });
        }

        return res.send({
            message: "success",
            data: courier,
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
}


const createCourier = async(req, res, _next) => {
    try {
        const currentUser = req.user;
        const { vehicle_type, vehicle_plate } = req.body;


        if (!vehicle_type || !vehicle_plate) {
            return res.status(400).send({ message: "Permintaan tidak valid, pastikan semua data diisi" });
        }

        const courierExist = await CourierModel.findOne({ where: { courier_id: currentUser.id } });
        if (courierExist) {
            return res.status(401).json({ message: "Profile sudah ada" });
        }

        const newProfile = await CourierModel.create({
            courier_id: currentUser.id,
            vehicle_type,
            vehicle_plate,
        });

        return res.send({
            message: "Profile created successfully",
            data: newProfile,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

const updateCourier = async(req, res, _next) => {
    try {
        const currentUser = req.user;
        const { vehicle_type, vehicle_plate, availability } = req.body;

        // if (!vehicle_type || !vehicle_plate) {
        //     return res.status(400).send({ message: "Permintaan tidak valid, pastikan semua data diisi" });
        // }

        const courierExist = await CourierModel.findOne({ where: { courier_id: currentUser.id } });
        if (!courierExist) {
            return res.status(401).json({ message: "Profile tidak ditemukan" });
        }

        const updatedProfile = await CourierModel.update({
            vehicle_type,
            vehicle_plate,
            availability
        }, {
            where: { courier_id: currentUser.id }
        });

        return res.send({
            message: "Profile updated successfully",
            data: updatedProfile,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

const serviceFcm = async(req, res) => {
    try {
    const { fcm_token } = req.body;
    const userId = req.user.id;

    await UserModel.update(
      { fcm_token },
      { where: { id: userId } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ error: 'Gagal menyimpan token' });
  }
}

module.exports = {
    indexUser,
    indexCourier,
    indexSeller,
    showUsers,
    indexSallery,
    show,
    createCourier,
    showCourier,
    updateCourier,
    serviceFcm
};