const multer = require("multer");
const { product: ProductModel, variant: VariantModel } = require("../models");

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */

const index = async(req, res, _next) => {
    try {
        let variants = await VariantModel.findAll({
            include: [{
                model: ProductModel,
                as: "product",
            }],
        });
        return res.send({
            message: "Success",
            data: variants,
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

        const variant = await VariantModel.findByPk(id, {
            attributes: ["id", "name", "price", "stock", "img_url"],
            include: [{
                model: ProductModel,
                as: "product",
            }],
        });

        if (!variant) {
            return res.status(404).send({
                message: "variant tidak ditemukan",
                data: null
            })
        }

        return res.send({
            message: "success",
            data: variant,
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


// const create = async(req, res, _next) => {
//     try {
//         const currentUser = req.user;
//         const { product_id, name, img_url, price, sku, stock } = req.body;

//         console.log("Request body:", req.body);

//         if (!req.file) {
//             return res.status(400).send({ message: "Gambar tidak ditemukan, pastikan gambar diunggah dengan benar" });
//         }

//         const image = req.file.path; // Cloudinary URL

//         console.log("image", image)

//         // if (currentUser.role !== 'seller' || currentUser.role !== 'admin') {
//         //     return res.status(403).send({ message: "Hanya seller yang dapat menambahkan produk" });
//         // }

//         if (!product_id || !name || !price || !stock || !type) {
//             return res.status(400).send({ message: "Permintaan tidak valid, pastikan semua data diisi" });
//         }

//         const product = await ProductModel.findOne({
//             where: {
//                 id: product_id,
//             },
//             include: [{
//                 model: VariantModel,
//                 as: "variants",
//             }],
//         });



//         const newVariant = await VariantModel.create({
//             seller_id: currentUser.id,
//             product_id,
//             name,
//             img_url: image,
//             sku,
//             price,
//             stock,
//             type
//         });

//         const insertStock = parseInt(product.stock) + parseInt(newVariant.stock);

//         await ProductModel.update({ stock: insertStock }, { where: { id: product_id } });

//         // console.log("New Variant:", newVariant);

//         return res.send({
//             message: "Variant created successfully",
//             data: newVariant,
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

// !dengan type

const create = async(req, res, _next) => {
    try {
        const currentUser = req.user;
        const { product_id, name, img_url, price, sku, stock, type } = req.body;

        if (!req.file) {
            return res.status(400).send({ message: "Gambar tidak ditemukan" });
        }

        const image = req.file.path;

        // Validasi field wajib
        if (!product_id || !name || !price || !stock || !type) {
            return res.status(400).send({ message: "Data tidak lengkap" });
        }

        // Cari produk beserta variantnya
        const product = await ProductModel.findOne({
            where: { id: product_id },
            include: [{
                model: VariantModel,
                as: "variant",
            }],
        });

        // Validasi 1: Pastikan produk ditemukan
        if (!product) {
            return res.status(404).send({ message: "Produk tidak ditemukan" });
        }

        // Validasi 2: Jika produk sudah memiliki variant
        if (product.variant && product.variant.length > 0) {
            // Cek KONSISTENSI TIPE pada semua variant
            const isAllSameType = product.variant.every(v => v.type === type);

            if (!isAllSameType) {
                const existingTypes = [...new Set(product.variant.map(v => v.type))];
                return res.status(400).send({
                    message: `Semua variant harus memiliki tipe yang sama. Tipe yang sudah ada: ${existingTypes.join(", ")}`,
                });
            }
        }

        // Buat variant baru
        const newVariant = await VariantModel.create({
            seller_id: currentUser.id,
            product_id,
            name,
            img_url: image,
            sku,
            price,
            stock,
            type
        });

        // Update stok produk
        const insertStock = parseInt(product.stock) + parseInt(newVariant.stock);
        await ProductModel.update({ stock: insertStock }, { where: { id: product_id } });

        return res.send({
            message: "Variant berhasil dibuat",
            data: newVariant,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};



// const update = async(req, res, _next) => {
//     try {
//         const currentUser = req.user;
//         const { variantId } = req.params;
//         const image = req.file ? req.file.path : null;
//         const { product_id, name, img_url, sku, price, stock, type } = req.body;

//         console.log("request body update", req.body);

//         if (!variantId) {
//             return res.status(400).send({ message: "Variant ID tidak ditemukan" });
//         }

//         if (!name || !price || !stock || !type) {
//             return res.status(400).send({ message: "Tidak ada data yang diperbarui" });
//         }

//         // Cari variant dan product terkait
//         const variant = await VariantModel.findOne({
//             where: { id: variantId, product_id }
//         });

//         console.log("variant", variant);

//         if (!variant) {
//             return res.status(404).send({ message: "Variant tidak ditemukan" });
//         }

//         const product = await ProductModel.findOne({
//             where: { id: product_id }
//         });

//         console.log("product", product);

//         if (!product) {
//             return res.status(404).send({ message: "Produk tidak ditemukan" });
//         }

//         // Parse nilai stok
//         const oldVariantStock = parseInt(variant.stock);
//         const newVariantStock = parseInt(stock);
//         const currentProductStock = parseInt(product.stock);

//         console.log("oldVariantStock", oldVariantStock);
//         console.log("newVariantStock", newVariantStock);
//         console.log("currentProductStock", currentProductStock);

//         // 1. KURANGI stok produk dengan stok variant yang akan diupdate
//         let afterReduction = currentProductStock - oldVariantStock;

//         // Jika hasil pengurangan negatif, set ke 0
//         if (afterReduction < 0) {
//             afterReduction = 0;
//         }

//         // 2. TAMBAHKAN stok produk dengan stok baru dari req.body
//         const finalProductStock = afterReduction + newVariantStock;

//         // Update stok produk
//         await ProductModel.update({ stock: finalProductStock }, { where: { id: product_id } });

//         // Update variant
//         const updatedVariant = await variant.update({
//             name,
//             img_url: image || img_url || variant.img_url,
//             sku,
//             price,
//             stock: newVariantStock,
//             type
//         });

//         return res.send({
//             message: "Variant updated successfully",
//             data: updatedVariant,
//         });
//     } catch (error) {
//         if (error instanceof multer.MulterError) {
//             return res.status(400).json({ message: error.message });
//         } else if (error.message === "File harus berupa gambar!") {
//             return res.status(400).json({ message: error.message });
//         } else {
//             console.error("Error:", error);
//             return res.status(500).json({ message: "Internal server error" });
//         }
//     }
// };


const update = async(req, res, _next) => {
    try {
        const currentUser = req.user;
        const { variantId } = req.params;
        const image = req.file ? req.file.path : null; // Menjadi null jika tidak ada file
        const { product_id, name, img_url, sku, price, stock } = req.body;

        // Memvalidasi inputan dari user
        if (!name || !price || !stock) {
            return res.status(400).send({ message: "Tidak ada data yang diperbarui" });
        }

        // Memastikan productId tidak undefined
        if (!variantId) {
            return res.status(400).send({ message: "Variant ID tidak ditemukan" });
        }

        // Memastikan hanya seller yang dapat memperbarui produk
        // if (currentUser.role !== 'seller') {
        //     return res.status(403).send({ message: "Hanya seller yang dapat memperbarui produk" });
        // }

        // Memastikan produk milik seller yang sedang login
        const variant = await VariantModel.findOne({
            where: {
                id: variantId,
                product_id: product_id,
            },
        });

        if (!variant) {
            return res.status(404).send({ message: "Variant tidak ditemukan atau Anda tidak memiliki izin untuk memperbaruinya" });
        }


        if (!variant) {
            return res.status(404).send({ message: "Variant tidak ditemukan" });
        }

        const product = await ProductModel.findOne({
            where: { id: product_id }
        });


        if (!product) {
            return res.status(404).send({ message: "Produk tidak ditemukan" });
        }

        // Parse nilai stok
        const oldVariantStock = parseInt(variant.stock);
        const newVariantStock = parseInt(stock);
        const currentProductStock = parseInt(product.stock);

        // 1. KURANGI stok produk dengan stok variant yang akan diupdate
        let afterReduction = currentProductStock - oldVariantStock;

        // Jika hasil pengurangan negatif, set ke 0
        if (afterReduction < 0) {
            afterReduction = 0;
        }

        // 2. TAMBAHKAN stok produk dengan stok baru dari req.body
        const finalProductStock = afterReduction + newVariantStock;

        // Update stok produk
        await ProductModel.update({ stock: finalProductStock }, { where: { id: product_id } });

        // Update produk
        const updatedVariant = await variant.update({
            product_id,
            name,
            img_url: image || img_url || variant.img_url,
            sku,
            price,
            stock
        });

        return res.send({
            message: "Variant updated successfully",
            data: updatedVariant,
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




/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */

const remove = async(req, res, _next) => {
    try {
        const currentUser = req.user;
        const { variantId } = req.body;


        // Memastikan hanya seller yang dapat menghapus produk
        // if (currentUser.role !== 'seller') {
        //     return res.status(403).send({ message: "Hanya seller yang dapat menghapus produk" });
        // }

        const variant = await VariantModel.findOne({
            where: {
                id: variantId,
            },
        });

        if (!variant) {
            return res.status(404).send({ message: "Variant tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya" });
        }

        await VariantModel.destroy({
            where: {
                id: variantId,
            },
        });

        const product = await ProductModel.findOne({
            where: {
                id: variant.product_id,
            },
        });

        const insertStock = parseInt(product.stock) - parseInt(variant.stock);

        await ProductModel.update({ stock: insertStock }, { where: { id: variant.product_id } });

        return res.send({ message: "Variant berhasil dihapus" });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};


module.exports = { index, show, create, remove, update };