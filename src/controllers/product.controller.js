const multer = require("multer");
const { user: UserModel, product: ProductModel, review: ReviewModel, variant: VariantModel } = require("../models");
const { Sequelize } = require("sequelize");

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */
const index = async(req, res, _next) => {
    try {
        const currentUser = req.user;
        // Ambil data produk dengan rating dan total reviews
        const products = await ProductModel.findAll({
            include: [{
                    model: UserModel,
                    as: "seller",
                },
                {
                    model: VariantModel,
                    as: "variant",
                }
            ],
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT AVG(r.rating)
                            FROM variants v
                            JOIN reviews r ON v.id = r.variant_id
                            WHERE v.product_id = product.id
                            AND r.rating IS NOT NULL
                        )`),
                        'rating'
                    ],
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(r.id)
                            FROM variants v
                            JOIN reviews r ON v.id = r.variant_id
                            WHERE v.product_id = product.id
                            AND r.rating IS NOT NULL
                        )`),
                        'totalReviews'
                    ]
                ]
            },
        });

        // Ambil semua reviews untuk produk-produk tersebut
        const productIds = products.map(p => p.id);
        const reviews = await ReviewModel.findAll({
            where: {
                '$variant.product_id$': productIds
            },
            include: [{
                    model: VariantModel,
                    as: "variant",
                    attributes: ['id', 'product_id'],
                },
                {
                    model: UserModel, // Jika review memiliki user/pembeli
                    as: "user",
                    attributes: ['id', 'name']
                }
            ],
            order: [
                    ['createdAt', 'DESC']
                ] // Urutkan dari yang terbaru
        });

        // Gabungkan reviews ke masing-masing produk
        const productsWithReviews = products.map(product => {
            const productReviews = reviews.filter(review =>
                review.variant && review.variant.product_id === product.id
            );

            return {
                ...product.get({ plain: true }),
                reviews: productReviews
            };
        });

        return res.send({
            message: "Success",
            data: productsWithReviews,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

const indexSeller = async(req, res, _next) => {
    try {
        const currentUser = req.user;

        let products;

        if (currentUser.role == 'seller') {
            products = await ProductModel.findAll({
                where: {
                    seller_id: currentUser.id,
                },
                include: [{
                    model: VariantModel,
                    as: "variant",
                }],
            });

            // Menghitung rata-rata rating untuk setiap produk
            products = products.map(product => {
                const reviewsWithRating = product.review.filter(review => review.rating !== null);
                const totalRating = reviewsWithRating.reduce((sum, review) => sum + review.rating, 0);
                const averageRating = reviewsWithRating.length > 0 ? (totalRating / reviewsWithRating.length) : null;

                // Update rating produk
                product.rating = averageRating;

                return product;
            });
        } else {
            return res.status(403).send({ message: "role tidak valid" });
        }

        return res.send({
            message: "Success",
            data: products,
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

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */
// const showDesc = async(req, res, _next) => {
//     try {
//         // const currentUser = req.user;
//         let products;

//         // Menentukan limit produk yang ditampilkan
//         const limit = 10;

//         // if (currentUser.role == "customer") {
//         // Jika user adalah customer, tampilkan 10 produk teratas berdasarkan total_sold
//         products = await ProductModel.findAll({
//             order: [
//                 ['total_sold', 'DESC']
//             ], // Urutkan berdasarkan total_sold secara menurun
//             limit: limit, // Batasi hasil hanya 10 produk
//             include: [{
//                     model: UserModel,
//                     as: "seller",
//                 },
//                 {
//                     model: VariantModel,
//                     as: "variant", // Pastikan nama alias sesuai dengan yang didefinisikan di model
//                 }
//             ],
//         });
//         // } else if (currentUser.role == 'seller') {
//         //     // Jika user adalah seller, tampilkan 10 produk teratas berdasarkan sold untuk seller tersebut
//         // products = await ProductModel.findAll({
//         //     where: {
//         //         user_id: currentUser.id,
//         //     },
//         //     order: [
//         //         ['sold', 'DESC']
//         //     ], // Urutkan berdasarkan sold secara menurun
//         //     limit: limit, // Batasi hasil hanya 10 produk
//         //     include: [
//         //         {
//         //             model: ReviewModel,
//         //             as: "review",
//         //         }
//         //     ],
//         // });
//         // } else {
//         //     return res.status(403).send({ message: "role tidak valid" });
//         // }

//         // Menghitung rata-rata rating untuk setiap produk
//         products = products.map(product => {
//             const reviewsWithRating = product.review.filter(review => review.rating !== null);
//             const totalRating = reviewsWithRating.reduce((sum, review) => sum + review.rating, 0);
//             const averageRating = reviewsWithRating.length > 0 ? (totalRating / reviewsWithRating.length) : null;

//             // Update rating produk
//             product.rating = averageRating;

//             return product;
//         });

//         return res.send({
//             message: "Success",
//             data: products,
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).send({ message: "Internal Server Error" });
//     }
// };
const showDesc = async(req, res, _next) => {
    try {
        const limit = 10;
        let products = await ProductModel.findAll({
            order: [
                ['total_sold', 'DESC']
            ],
            limit: limit,
            include: [{
                    model: UserModel,
                    as: "seller",
                },
                {
                    model: VariantModel,
                    as: "variant",
                    include: [ // Include reviews untuk setiap variant
                        {
                            model: ReviewModel,
                            as: "review",
                            attributes: ['rating'], // Ambil hanya rating
                            where: {
                                rating: {
                                    [Sequelize.Op.ne]: null
                                }
                            } // Hanya rating valid
                        }
                    ]
                }
            ],
        });

        // Hitung rata-rata rating per produk
        products = products.map(product => {
            // Kumpulkan semua rating dari semua variant produk
            let allRatings = [];
            product.variant.forEach(variant => {
                variant.review.forEach(review => {
                    if (review.rating !== null) {
                        allRatings.push(review.rating);
                    }
                });
            });

            // Hitung rata-rata
            const averageRating = allRatings.length > 0 ?
                allRatings.reduce((a, b) => a + b, 0) / allRatings.length :
                null;

            // Tambahkan properti rating ke produk
            return {
                ...product.get({ plain: true }),
                rating: averageRating
            };
        });

        return res.send({
            message: "Success",
            data: products,
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

const show = async(req, res, next) => {
    try {
        const { id } = req.params;

        const product = await ProductModel.findByPk(id, {
            attributes: ["id", "name", "description", "price", "stock", "image_url", "total_sold", "category"],
            include: [{
                    model: VariantModel,
                    as: "variant",
                    include: [{
                        model: ReviewModel,
                        as: "review",
                        include: [{
                            model: UserModel,
                            as: "user",
                            attributes: ["id", "name"]
                        }]
                    }]
                },
                {
                    model: UserModel,
                    as: "seller",
                    attributes: ["id", "name", "profile_image", "email", "phone_number", "address", ]
                }
            ]

        });

        if (!product) {
            return res.status(404).send({
                message: "product tidak ditemukan",
                data: null
            })
        }

        return res.send({
            message: "success",
            data: product,
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


const create = async(req, res, _next) => {
    try {
        const currentUser = req.user;
        const { seller_id, name, description, image_url, price, stock, category } = req.body;

        if (!req.file) {
            return res.status(400).send({ message: "Gambar tidak ditemukan, pastikan gambar diunggah dengan benar" });
        }

        const image = req.file.path; // Cloudinary URL

        // Perbaikan logika pengecekan role
        if (currentUser.role !== 'seller' && currentUser.role !== 'admin') {
            return res.status(403).send({ message: "Hanya seller atau admin yang dapat menambahkan produk" });
        }

        if (!name || !description || !price || !stock || !category) {
            return res.status(400).send({ message: "Permintaan tidak valid, pastikan semua data diisi" });
        }
        // Tentukan seller_id berdasarkan role
        let productSellerId;
        if (currentUser.role === 'admin') {
            // Untuk admin, gunakan seller_id dari params
            if (!seller_id) {
                return res.status(400).send({ message: "seller_id diperlukan untuk admin" });
            }
            productSellerId = seller_id;
        } else {
            // Untuk seller, gunakan id user yang login
            productSellerId = currentUser.id;
        }

        const newProduct = await ProductModel.create({
            seller_id: productSellerId,
            name,
            description,
            image_url: image,
            price,
            stock,
            category,
        });


        return res.send({
            message: "Product created successfully",
            data: newProduct,
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



// const update = async(req, res, _next) => {
//     try {
//         const currentUser = req.user;
//         const { productId } = req.params;
//         const image = req.file.path;
//         const { name, description, image_url, price, stock, category } = req.body;

//         console.log("request body update", req.body)


//         // Memastikan productId tidak undefined
//         if (!productId) {
//             return res.status(400).send({ message: "Product ID tidak ditemukan" });
//         }

//         // Memastikan hanya seller yang dapat memperbarui produk
//         if (currentUser.role !== 'seller') {
//             return res.status(403).send({ message: "Hanya seller yang dapat memperbarui produk" });
//         }

//         // Memastikan produk milik seller yang sedang login
//         const product = await ProductModel.findOne({
//             where: {
//                 id: productId,
//                 seller_id: currentUser.id,
//             },
//         });

//         if (!product) {
//             return res.status(404).send({ message: "Produk tidak ditemukan atau Anda tidak memiliki izin untuk memperbaruinya" });
//         }

//         // Memvalidasi inputan dari user
//         if (!name || !description || !stock) {
//             return res.status(400).send({ message: "Tidak ada data yang diperbarui" });
//         }

//         // Update produk
//         const updatedProduct = await product.update({
//             name,
//             image_url: image,
//             description,
//             price,
//             stock,
//             category,
//         });

//         return res.send({
//             message: "Product updated successfully",
//             data: updatedProduct,
//         });
//     } catch (error) {
//         if (error instanceof multer.MulterError) {
//             // Tangani error Multer
//             return res.status(400).json({ message: error.message });
//         } else if (error.message === "File harus berupa gambar!") {
//             return res.status(400).json({ message: error.message });
//         } else {
//             // Error lainnya
//             console.error("Error:", error.message); // Hanya untuk debugging
//             return res.status(500).json({ message: "Internal server error" });
//         }
//     }
// };
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

// const update = async(req, res) => {
//     try {
//         const currentUser = req.user;
//         const { productId } = req.params;
//         const { name, description, price, stock, category } = req.body;
//         const image = req.file.path; // Gambar bersifat optional

//         // 1. Validasi dasar
//         if (!productId) {
//             return res.status(400).json({ message: "Product ID diperlukan" });
//         }

//         // 2. Cari produk yang akan diupdate
//         const product = await ProductModel.findByPk(productId);
//         if (!product) {
//             return res.status(404).json({ message: "Produk tidak ditemukan" });
//         }

//         // 3. Authorization Check
//         if (currentUser.role === 'seller' && product.seller_id.toString() !== currentUser.id) {
//             return res.status(403).json({
//                 message: "Akses ditolak - Anda bukan pemilik produk ini"
//             });
//         }

//         // 4. Siapkan data update
//         const updateData = {
//             name: name || product.name,
//             description: description || product.description,
//             price: price || product.price,
//             stock: stock || product.stock,
//             category: category || product.category,
//             ...(image && { image_url: image }) // Update gambar hanya jika ada
//         };

//         // 5. Proses update
//         const updatedProduct = await product.update(
//             productId,
//             updateData, { new: true } // Return produk yang sudah diupdate
//         );

//         return res.json({
//             message: "Produk berhasil diupdate",
//             data: updatedProduct
//         });

//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).json({
//             message: error.message || "Internal server error"
//         });
//     }
// };

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */

// const remove = async(req, res, _next) => {
//     try {
//         const currentUser = req.user;
//         const { productId } = req.params;

//         console.log("id", productId)

//         // Perbaikan logika pengecekan role
//         if (currentUser.role !== 'seller' && currentUser.role !== 'admin') {
//             return res.status(403).send({ message: "Hanya seller atau admin yang dapat menambahkan produk" });
//         }


//         const product = await ProductModel.findOne({
//             where: {
//                 id: productId,
//                 seller_id: currentUser.id, // Memastikan produk milik seller yang sedang login
//             },
//         });

//         if (!product) {
//             return res.status(404).send({ message: "Produk tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya" });
//         }

//         await ProductModel.destroy({
//             where: {
//                 id: productId,
//             },
//         });

//         return res.send({ message: "Produk berhasil dihapus" });
//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).send({ message: "Internal Server Error" });
//     }
// };

const remove = async(req, res) => {
    try {
        const currentUser = req.user;
        const { productId } = req.body; // Sekarang mengambil dari body

        // console.log('Delete request received:', { productId, user: currentUser.id });

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        // Validasi role
        if (currentUser.role !== 'seller' && currentUser.role !== 'admin') {
            return res.status(403).json({
                message: "Hanya seller atau admin yang dapat menghapus produk"
            });
        }

        // Cari produk termasuk seller_id untuk validasi kepemilikan
        const product = await ProductModel.findOne({
            where: { id: productId },
            attributes: ['id', 'seller_id']
        });

        if (!product) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        // Validasi kepemilikan (kecuali admin)
        if (currentUser.role !== 'admin' && product.seller_id !== currentUser.id) {
            return res.status(403).json({
                message: "Anda tidak memiliki izin untuk menghapus produk ini"
            });
        }

        // Lakukan penghapusan
        await ProductModel.destroy({ where: { id: productId } });

        return res.json({
            success: true,
            message: "Produk berhasil dihapus"
        });

    } catch (error) {
        console.error("Delete product error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
};

module.exports = { index, indexSeller, showDesc, show, create, remove, update };