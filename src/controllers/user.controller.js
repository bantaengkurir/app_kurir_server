const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const { user: UserModel, product: ProductModel, order: OrderModel, shipping_cost: ShippingModel, payment: PaymentModel, courier_earning: Courier_earningModel, courier: CourierModel } = require("../models");
const { axios } = require("axios");
const nodemailer = require("nodemailer");


const sendVerificationEmail = async(email) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false, // Abaikan validasi sertifikat
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Verify Your Password Reset",
        text: `Your verification link: ${process.env.APP_URL}/verify?email=${email}`,
    };

    await transporter.sendMail(mailOptions);
};

const reverseGeocode = async(latitude, longitude) => {
    const apiKey = process.env.API_KEY_GEOCODING_MAPS;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    try {
        const response = await axios.get(url);
        if (response.data.results.length > 0) {
            return response.data.results[0].formatted_address;
        }
        throw new Error('Alamat tidak ditemukan');
    } catch (error) {
        console.error('Error reverse geocoding:', error.response ? error.response.data : error.message);
        throw new Error('Terjadi kesalahan saat mengambil alamat');
    }
};

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
        // if (req.user.role !== "admin") {
        //     return res.status(403).send({
        //         message: "Forbidden: You are not allowed to access this resource.",
        //     });
        // }

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

        // if (req.user.role !== "admin") {
        //     return res.status(403).send({
        //         message: "Forbidden: You are not allowed to access this resource.",
        //     });
        // }

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

        await UserModel.update({ fcm_token }, { where: { id: userId } });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error saving FCM token:', error);
        res.status(500).json({ error: 'Gagal menyimpan token' });
    }
}
const update = async(req, res, _next) => {
    try {
        const currentUser = req.user;
        const { productId } = req.params;
        const image = req.file ? req.file.path : null; // Menjadi null jika tidak ada file
        const { name, description, image_url, price, stock, category } = req.body;


        // Memastikan productId tidak undefined
        if (!productId) {
            return res.status(400).send({ message: "Product ID tidak ditemukan" });
        }

        // Memastikan hanya seller yang dapat memperbarui produk
        // if (currentUser.role !== 'seller') {
        //     return res.status(403).send({ message: "Hanya seller yang dapat memperbarui produk" });
        // }
        // Perbaikan logika pengecekan role
        if (currentUser.role !== 'seller' && currentUser.role !== 'admin') {
            return res.status(403).send({ message: "Hanya seller atau admin yang dapat menambahkan produk" });
        }


        // Memastikan produk milik seller yang sedang login
        const product = await ProductModel.findOne({
            where: {
                id: productId,
            },
        });

        if (!product) {
            return res.status(404).send({ message: "Produk tidak ditemukan atau Anda tidak memiliki izin untuk memperbaruinya" });
        }

        // Memvalidasi inputan dari user
        if (!name || !description || !stock) {
            return res.status(400).send({ message: "Tidak ada data yang diperbarui" });
        }

        // Update produk
        const updatedProduct = await product.update({
            name,
            image_url: image || image_url || product.image_url,
            description,
            price,
            stock,
            category,
        });

        return res.send({
            message: "Product updated successfully",
            data: updatedProduct,
        });
    } catch (error) {
        if (error instanceof multer.MulterError) {
            // Tangani error Multer
            return res.status(400).json({ message: error.message });
        } else if (error.message === "File harus berupa gambar!") {
            return res.status(400).json({ message: error.message });
        } else {
            // Error lainnya
            console.error("Error:", error.message); // Hanya untuk debugging
            return res.status(500).json({ message: "Internal server error" });
        }
    }
};
const updateUser = async(req, res, _next) => {
    try {
        const { userId } = req.params;
        const image = req.file ? req.file.path : null;
        const currentUser = req.user;

        if (!userId) {
            return res.status(400).send({ message: "User ID tidak ditemukan" });
        }

        // if (currentUser.id !== userId) {
        //     return res.status(403).json({ message: "Unauthorized: Anda hanya bisa mengupdate profil sendiri" });
        // }
        const {
            name,
            address,
            latitude,
            longitude,
            phone_number,
            gender,
            date_of_birth
        } = req.body;



        const userExist = await UserModel.findOne({ where: { id: userId } });
        if (!userExist) {
            return res.status(401).json({ message: "User tidak ditemukan" });
        }
        // const address = await reverseGeocode(latitude, longitude);

        const updatedProfile = await UserModel.update({
            name,
            address,
            latitude,
            longitude,
            profile_image: image,
            phone_number,
            gender,
            date_of_birth
        }, {
            where: { id: userId }
        });

        // Ambil data user yang sudah diupdate
        // const updatedUser = await UserModel.findOne({
        //     where: { id },
        //     attributes: { exclude: ['password'] } // Hindari mengembalikan password
        // });

        return res.send({
            message: "Update successfully",
            data: updatedProfile, // Kirim data user yang sudah diupdate
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};
const resetPasswordLink = async(req, res, _next) => {
    const { email } = req.body;

    try {
        const user = await UserModel.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({
                message: 'Email tidak ditemukan'
            });
        }

        if (user.provider !== "local") {
            return res.status(403).json({
                message: "Anda menggunakan login dengan akun Google, tidak bisa melakukan reset password"
            })
        }

        // Generate token dan waktu kedaluwarsa
        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + 5); // 5 menit

        await user.update({
            reset_password_token: token,
            reset_password_expires: expires
        });

        // Kirim email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Reset Password",
            html: `<p>Silakan klik link berikut untuk reset password (berlaku 5 menit):</p>
             <a href="${process.env.CLIENT_URL}/reset-password?token=${token}">
               Reset Password
             </a>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Link reset password telah dikirim', token });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const resetPassword = async(req, res, _next) => {
    const { token, password } = req.body;

    try {
        // Cari user berdasarkan token
        const user = await UserModel.findOne({
            where: {
                reset_password_token: token,
                // reset_password_expires: {
                //     [Op.gt]: new Date()
                // } // Cek masa berlaku
            }
        });


        if (!user) {
            return res.status(400).json({
                message: 'Token tidak valid atau sudah kedaluwarsa'
            });
        }

        // Validasi password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password harus mengandung minimal 8 karakter, huruf besar, kecil, angka, dan simbol"
            });
        }

        // Update password dan reset token
        const hashedPassword = await bcrypt.hash(password, 10);
        await user.update({
            password: hashedPassword,
            reset_password_token: null,
            reset_password_expires: null
        });

        res.status(200).json({ message: 'Password berhasil direset' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

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
    resetPassword,
    resetPasswordLink,
    updateUser,
    serviceFcm
};