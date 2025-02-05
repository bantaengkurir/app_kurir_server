const { user: UserModel, product: ProductModel, review: ReviewModel } = require("../models");

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */

const index = async(req, res, _next) => {
    try {
        // const currentUser = req.user;
        let products;


        // if (currentUser.role == "customer") {
        //     // Jika user adalah customer, tampilkan semua produk
        products = await ProductModel.findAll({
            include: [{
                model: UserModel,
                as: "seller",
            }],
        });
        // } else if (currentUser.role == 'seller') {
        //     // Jika user adalah seller, tampilkan produk berdasarkan user_id
        //     products = await ProductModel.findAll({
        //         where: {
        //             user_id: currentUser.id,
        //         },
        //     });
        // } else {
        //     return res.status(403).send({ message: "role tidak valid" });
        // }

        return res.send({
            message: "Success",
            data: products,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};
const indexSeller = async(req, res, _next) => {
    try {
        const currentUser = req.user;

        console.log("user", currentUser)

        let products;

        if (currentUser.role == 'seller') {
            products = await ProductModel.findAll({
                where: {
                    seller_id: currentUser.id,
                },
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
const showDesc = async(req, res, _next) => {
    try {
        // const currentUser = req.user;
        let products;

        // Menentukan limit produk yang ditampilkan
        const limit = 10;

        // if (currentUser.role == "customer") {
        // Jika user adalah customer, tampilkan 10 produk teratas berdasarkan sold
        products = await ProductModel.findAll({
            order: [
                ['total_sold', 'DESC']
            ], // Urutkan berdasarkan sold secara menurun
            limit: limit, // Batasi hasil hanya 10 produk
        });
        // } else if (currentUser.role == 'seller') {
        //     // Jika user adalah seller, tampilkan 10 produk teratas berdasarkan sold untuk seller tersebut
        // products = await ProductModel.findAll({
        //     where: {
        //         user_id: currentUser.id,
        //     },
        //     order: [
        //         ['sold', 'DESC']
        //     ], // Urutkan berdasarkan sold secara menurun
        //     limit: limit, // Batasi hasil hanya 10 produk
        // });
        // } else {
        //     return res.status(403).send({ message: "role tidak valid" });
        // }

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
            attributes: ["id", "name", "description", "price", "stock", "image_url"],
            // include: [{
            //     model: CategoryModel,
            //     as: "category",
            // }],
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
        const { name, description, image_url, price, stock, category } = req.body;

        console.log("Request body:", req.body);

        if (!req.file) {
            return res.status(400).send({ message: "Gambar tidak ditemukan, pastikan gambar diunggah dengan benar" });
        }

        const image = req.file.path; // Cloudinary URL

        console.log("image", image)

        if (currentUser.role !== 'seller') {
            return res.status(403).send({ message: "Hanya seller yang dapat menambahkan produk" });
        }

        if (!name || !description || !price || !stock || !category) {
            return res.status(400).send({ message: "Permintaan tidak valid, pastikan semua data diisi" });
        }

        const newProduct = await ProductModel.create({
            seller_id: currentUser.id,
            name,
            description,
            image_url: image,
            price,
            stock,
            category,
        });

        console.log("New product:", newProduct);

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



const update = async(req, res, _next) => {
    try {
        const currentUser = req.user;
        const { productId } = req.params;
        const image = req.file.path;
        const { name, description, image_url, price, stock, category } = req.body;

        console.log("request body update", req.body)


        // Memastikan productId tidak undefined
        if (!productId) {
            return res.status(400).send({ message: "Product ID tidak ditemukan" });
        }

        // Memastikan hanya seller yang dapat memperbarui produk
        if (currentUser.role !== 'seller') {
            return res.status(403).send({ message: "Hanya seller yang dapat memperbarui produk" });
        }

        // Memastikan produk milik seller yang sedang login
        const product = await ProductModel.findOne({
            where: {
                id: productId,
                seller_id: currentUser.id,
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
            image_url: image,
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


/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */

const remove = async(req, res, _next) => {
    try {
        const currentUser = req.user;
        const { productId } = req.params;

        console.log("id", productId)

        // Memastikan hanya seller yang dapat menghapus produk
        if (currentUser.role !== 'seller') {
            return res.status(403).send({ message: "Hanya seller yang dapat menghapus produk" });
        }

        const product = await ProductModel.findOne({
            where: {
                id: productId,
                seller_id: currentUser.id, // Memastikan produk milik seller yang sedang login
            },
        });

        if (!product) {
            return res.status(404).send({ message: "Produk tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya" });
        }

        await ProductModel.destroy({
            where: {
                id: productId,
            },
        });

        return res.send({ message: "Produk berhasil dihapus" });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};


module.exports = { index, indexSeller, showDesc, show, create, remove, update };