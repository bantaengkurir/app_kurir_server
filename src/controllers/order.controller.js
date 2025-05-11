const {
    courier: CourierModel,
    user: UserModel,
    order: OrderModel,
    product: ProductModel,
    orderitem: OrderItemModel,
    shipping_cost: ShippingModel,
    payment: PaymentModel,
    order_historie: HistoryModel,
    review: ReviewModel,
    courier_rating: CourierRatingModel,
    seller_earning: Seller_earningModel,
    courier_earning: Courier_earningModel
} = require("../models");

const { sequelize } = require('../models');

const axios = require('axios');
const order = require("../models/order");
const geolib = require('geolib');
const { io } = require("../config/socket"); // Import WebSocket server

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */

// const index = async(req, res, next) => {
//     try {
//         const orders = await OrderModel.findAll({
//             where: {
//                 user_id: req.user.id,
//             },
//             include: [{
//                     model: UserModel,
//                     as: "couriers",
//                     attributes: ["id", "name", "email", "profile_image", "phone_number", "latitude", "longitude"],
//                     include: [{
//                         model: CourierModel,
//                         as: "courier"
//                     }]
//                 },
//                 {
//                     model: ShippingModel,
//                     as: "shipping_cost",
//                 },
//                 {
//                     model: PaymentModel,
//                     as: "payment",
//                 },
//                 {
//                     model: OrderItemModel,
//                     as: "orderitem",
//                     include: [{
//                         model: ProductModel,
//                         as: "product",
//                         include: [{
//                             model: UserModel,
//                             as: "seller"
//                         }]
//                     }, ],
//                 },
//             ],
//         });

//         const formattedOrders = orders.map((order) => {
//             // Menghitung total quantity dari orderitem
//             const totalQuantity = order.orderitem.reduce((acc, item) => acc + item.quantity, 0);

//             return {
//                 user_id: order.user_id,
//                 order_id: order.id,
//                 total: parseFloat(order.total_price),
//                 quantity: totalQuantity,
//                 order_code: order.order_code,
//                 order_date: order.order_date,
//                 status: order.status,
//                 payment_method: order.payment_method,
//                 payment_status: order.payment_status,
//                 address: order.shipping_cost ? order.shipping_cost.address : null,
//                 latitude: order.shipping_cost ? order.shipping_cost.latitude : null,
//                 longitude: order.shipping_cost ? order.shipping_cost.longitude : null,
//                 distance: order.shipping_cost ? order.shipping_cost.distance : null,
//                 created_at: order.created_at,
//                 // courier: order.couriers,
//                 courier: {
//                     id: order.couriers.id,
//                     name: order.couriers.name,
//                     email: order.couriers.email,
//                     profile_image: order.couriers.profile_image,
//                     phone_number: order.couriers.phone_number,
//                     latitude: order.couriers.latitude,
//                     longitude: order.couriers.longitude,
//                     vehicle_type: order.couriers.courier ? order.couriers.courier.length > 0 ? order.couriers.courier[0].vehicle_type : null : null,
//                     vehicle_plate: order.couriers.courier ? order.couriers.courier.length > 0 ? order.couriers.courier[0].vehicle_plate : null : null,
//                 },

//                 items: order.orderitem.map((item) => ({
//                     product_id: item.product.id,
//                     seller_id: item.product.seller_id,
//                     name: item.product.name,
//                     description: item.product.description,
//                     image_url: item.product.image_url,
//                     price: parseFloat(item.product.price),
//                     stock: item.product.stock,
//                     quantity: item.quantity,
//                     seller_name: item.product.seller ? item.product.seller.name : null, // Perbaikan di sini
//                     seller_phone_number: item.product.seller ? item.product.seller.phone_number : null, // Perbaikan di sini
//                     seller_address: item.product.seller ? item.product.seller.address : null,
//                     seller_latitude: item.product.seller ? item.product.seller.latitude : null,
//                     seller_longitude: item.product.seller ? item.product.seller.longitude : null,
//                     seller_profile_image: item.product.seller ? item.product.seller.profile_image : null,
//                 })),
//                 shipping_cost: order.shipping_cost,
//                 // payment: order.payment,
//             };
//         });

//         return res.send({
//             message: "Success",
//             data: formattedOrders,
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).send({ message: "Internal Server Error" });
//     }
// };

const index = async(req, res, next) => {
    try {
        let whereCondition = {};

        // Jika user bukan admin, filter berdasarkan user_id
        if (req.user.role !== "admin") {
            whereCondition.user_id = req.user.id;
        }

        // console.log("user", req.user);

        const orders = await OrderModel.findAll({
            where: whereCondition, // Gunakan kondisi where yang sudah ditentukan
            include: [{
                    model: UserModel,
                    as: "couriers",
                    attributes: ["id", "name", "email", "profile_image", "phone_number", "latitude", "longitude"],
                    include: [{
                        model: CourierModel,
                        as: "courier"
                    }]
                },
                {
                    model: ShippingModel,
                    as: "shipping_cost",
                },
                {
                    model: PaymentModel,
                    as: "payment",
                },
                {
                    model: OrderItemModel,
                    as: "orderitem",
                    include: [{
                        model: ProductModel,
                        as: "product",
                        include: [{
                            model: UserModel,
                            as: "seller"
                        }]
                    }],
                },
            ],
        });

        const formattedOrders = orders.map((order) => {
            // Menghitung total quantity dari orderitem
            const totalQuantity = order.orderitem.reduce((acc, item) => acc + item.quantity, 0);

            return {
                user_id: order.user_id,
                order_id: order.id,
                total: parseFloat(order.total_price),
                quantity: totalQuantity,
                order_code: order.order_code,
                order_date: order.order_date,
                status: order.status,
                payment_method: order.payment_method,
                payment_status: order.payment_status,
                address: order.shipping_cost ? order.shipping_cost[0].address : null,
                latitude: order.shipping_cost ? order.shipping_cost[0].latitude : null,
                longitude: order.shipping_cost ? order.shipping_cost[0].longitude : null,
                distance: order.shipping_cost ? order.shipping_cost[0].distance : null,
                created_at: order.createdAt,
                courier: {
                    id: order.couriers.id,
                    name: order.couriers.name,
                    email: order.couriers.email,
                    profile_image: order.couriers.profile_image,
                    phone_number: order.couriers.phone_number,
                    latitude: order.couriers.latitude,
                    longitude: order.couriers.longitude,
                    vehicle_type: order.couriers.courier ? order.couriers.courier.length > 0 ? order.couriers.courier[0].vehicle_type : null : null,
                    vehicle_plate: order.couriers.courier ? order.couriers.courier.length > 0 ? order.couriers.courier[0].vehicle_plate : null : null,
                },
                items: order.orderitem.map((item) => ({
                    product_id: item.product.id,
                    seller_id: item.product.seller_id,
                    name: item.product.name,
                    description: item.product.description,
                    image_url: item.product.image_url,
                    price: parseFloat(item.product.price),
                    stock: item.product.stock,
                    quantity: item.quantity,
                    seller_name: item.product.seller ? item.product.seller.name : null,
                    seller_phone_number: item.product.seller ? item.product.seller.phone_number : null,
                    seller_address: item.product.seller ? item.product.seller.address : null,
                    seller_latitude: item.product.seller ? item.product.seller.latitude : null,
                    seller_longitude: item.product.seller ? item.product.seller.longitude : null,
                    seller_profile_image: item.product.seller ? item.product.seller.profile_image : null,
                })),
                shipping_cost: order.shipping_cost,
            };
        });

        return res.send({
            message: "Success",
            data: formattedOrders,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};


const indexCourier = async(req, res, next) => {
    try {
        const orders = await OrderModel.findAll({

            include: [{
                    model: UserModel,
                    as: "couriers",
                    where: { id: req.user.id }, // Filter berdasarkan ID user yang login sebagai courier
                    required: true, // Hanya tampilkan order yang memiliki relasi dengan courier
                    attributes: ["id", "name", "email", "profile_image", "phone_number", "latitude", "longitude"],
                    include: [{
                        model: CourierModel,
                        as: "courier"
                    }]
                },
                {
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
                {
                    model: OrderItemModel,
                    as: "orderitem",
                    include: [{
                        model: ProductModel,
                        as: "product",
                        include: [{
                            model: UserModel,
                            as: "seller"
                        }]
                    }],
                },
            ],
        });

        // console.log("ini user", req.user)

        const formattedOrders = orders.map((order) => {
            const totalQuantity = order.orderitem.reduce((acc, item) => acc + item.quantity, 0);

            return {
                order_id: order.id,
                user_id: order.user_id,
                total: parseFloat(order.total_price),
                quantity: totalQuantity,
                order_code: order.order_code,
                order_date: order.order_date,
                status: order.status,
                payment_method: order.payment_method,
                payment_status: order.payment_status,
                address: order.shipping_cost.address,
                latitude: order.shipping_cost.latitude,
                longitude: order.shipping_cost.longitude,
                distance: order.shipping_cost.distance,
                created_at: order.created_at,
                user: {
                    id: order.user.id,
                    name: order.user.name,
                    email: order.user.email,
                    profile_image: order.user.profile_image,
                    phone_number: order.user.phone_number,
                    address: order.user.address,
                    latitude: order.user.latitude,
                    longitude: order.user.longitude,
                    gender: order.user.gender,
                    date_of_birth: order.user.date_of_birth,

                },
                courier: {
                    id: order.couriers.id,
                    name: order.couriers.name,
                    img_url: order.couriers.img_url,
                    phone_number: order.couriers.phone_number,
                    profile_image: order.couriers.profile_image,
                    vehicle_type: order.couriers.courier ? order.couriers.courier.length > 0 ? order.couriers.courier[0].vehicle_type : null : null,
                    vehicle_plate: order.couriers.courier ? order.couriers.courier.length > 0 ? order.couriers.courier[0].vehicle_plate : null : null,
                },
                items: order.orderitem.map((item) => ({
                    product_id: item.product.id,
                    name: item.product.name,
                    description: item.product.description,
                    image_url: item.product.image_url,
                    rating: item.product.rating,
                    category: item.product.category,
                    price: parseFloat(item.product.price),
                    quantity: item.quantity,
                    seller_name: item.product.seller ? item.product.seller.name : null, // Perbaikan di sini
                    seller_phone_number: item.product.seller ? item.product.seller.phone_number : null, // Perbaikan di sini
                    seller_address: item.product.seller ? item.product.seller.address : null,
                    seller_latitude: item.product.seller ? item.product.seller.latitude : null,
                    seller_longitude: item.product.seller ? item.product.seller.longitude : null,
                    seller_profile_image: item.product.seller ? item.product.seller.profile_image : null,
                })),
                shipping_cost: order.shipping_cost,
            };
        });

        return res.send({
            message: "Success",
            data: formattedOrders,
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



const create = async(req, res, next) => {
    const { items, payment_method, shipping_cost } = req.body;
    const { latitude, longitude } = shipping_cost || {};
    const currentUser = req.user;

    const idOrder = items.map((item) => item.product_id);

    // console.log("body", req.body)

    if (idOrder.length === 0) {
        return res.status(400).send({ message: "Data tidak ditemukan" });
    }

    if (!currentUser || !currentUser.id) {
        return res.status(401).send({ message: "User tidak terautentikasi" });
    }

    // Ambil produk beserta seller
    const products = await ProductModel.findAll({
        where: {
            id: idOrder,
        },
        include: [{
            model: UserModel,
            as: 'seller',
            attributes: ['id', 'latitude', 'longitude']
        }]
    });

    if (products.length !== idOrder.length) {
        return res.status(400).send({ message: "Satu atau lebih produk tidak ditemukan" });
    }

    // Kelompokkan produk berdasarkan seller
    const sellers = products.reduce((acc, product) => {
        const sellerId = product.seller.id;
        if (!acc[sellerId]) {
            acc[sellerId] = {
                seller: product.seller,
                products: []
            };
        }
        acc[sellerId].products.push(product);
        return acc;
    }, {});

    const sellerGroups = Object.values(sellers);

    // Validasi lokasi semua seller
    for (const group of sellerGroups) {
        const seller = group.seller;
        if (!seller || !seller.latitude || !seller.longitude) {
            return res.status(400).send({ message: "Lokasi seller tidak valid" });
        }
    }

    // Generate order code
    let code;
    for (let i = 0; i < products.length; i++) {
        if (products[i].status === "makanan") {
            code = "01" + Math.floor(Math.random() * 1000000);
        } else if (products[i].status === "minuman") {
            code = "02" + Math.floor(Math.random() * 1000000);
        } else {
            code = "03" + Math.floor(Math.random() * 1000000);
        }
    }

    // Pilih kurir yang online dan statusnya "ready"
    const couriers = await UserModel.findAll({
        where: {
            role: "courier",
            status: "online",
        },
        attributes: ['id', 'latitude', 'longitude']
    });

    if (couriers.length === 0) {
        return res.status(400).send({ message: "Tidak ada courier yang tersedia" });
    }
    const courierReady = await UserModel.findAll({
        where: {
            role: "courier",
        },
        include: [{
            model: CourierModel,
            as: "courier", // Pastikan sesuai dengan relasi yang didefinisikan
            where: {
                availability: "ready", // ✅ Filter berdasarkan availability di tabel Courier
            },
            required: true, // INNER JOIN (hambil User yang punya relasi Courier)
        }],
        attributes: ['id', 'latitude', 'longitude'],
    });

    if (courierReady.length === 0) {
        return res.status(400).send({ message: "Tidak ada courier yang ready" });
    }


    // Fungsi hitung jarak jalan
    const getRoadDistance = async(origin, destination) => {
        const apiKey = process.env.API_KEY_GEOCODING_MAPS;
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${apiKey}`;

        try {
            const response = await axios.get(url);
            if (response.data.rows[0].elements[0].status === "OK") {
                return response.data.rows[0].elements[0].distance.value;
            }
            throw new Error("Jarak tidak ditemukan");
        } catch (error) {
            console.error("Error calculating road distance:", error);
            throw new Error("Gagal menghitung jarak");
        }
    };

    // Hitung total jarak ke semua seller
    let totalDistance = 0;
    try {
        const userLocation = { latitude, longitude };
        const distancePromises = sellerGroups.map(async(group) => {
            return await getRoadDistance(userLocation, {
                latitude: group.seller.latitude,
                longitude: group.seller.longitude
            });
        });

        const distances = await Promise.all(distancePromises);
        totalDistance = distances.reduce((sum, dist) => sum + dist, 0);
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }

    // Hitung biaya pengiriman
    let shipping = 0;
    if (totalDistance <= 1000) {
        shipping = 5000;
    } else {
        const additionalDistance = totalDistance - 1000;
        const additionalKm = additionalDistance / 1000; // Pembulatan ke atas untuk km selanjutnya
        shipping = 5000 + additionalKm * 1500;
    }
    shipping = Math.round(shipping);

    // Pilih kurir terdekat ke user
    let closestCourier = null;
    let minDistance = Infinity;
    for (const courier of couriers) {
        const courierDistance = geolib.getDistance({ latitude, longitude }, { latitude: courier.latitude, longitude: courier.longitude });
        if (courierDistance < minDistance) {
            minDistance = courierDistance;
            closestCourier = courier;
        }
    }

    if (!closestCourier) {
        return res.status(400).send({ message: "Tidak ada courier dalam jangkauan" });
    }

    // Buat order
    const newOrder = await OrderModel.create({
        user_id: currentUser.id,
        courier_id: closestCourier.id,
        order_date: new Date(),
        payment_method,
        order_code: code,
    });

    // Hitung total harga
    let totalPrice = 0;
    const orderItems = items.map((item) => {
        const product = products.find((b) => b.id === item.product_id);
        const subtotal = product.price * item.quantity;
        totalPrice += subtotal;

        return {
            order_id: newOrder.id,
            courier_id: newOrder.courier_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: product.price,
            subtotal: subtotal,
        };
    });

    await OrderItemModel.bulkCreate(orderItems);

    await OrderModel.update({
        total_price: totalPrice,
        status: "Pending",
    }, {
        where: { id: newOrder.id },
    });

    // Buat data pengiriman
    const address = await reverseGeocode(latitude, longitude);
    const newShipping = await ShippingModel.create({
        order_id: newOrder.id,
        address,
        latitude,
        longitude,
        distance: totalDistance,
        shipping_cost: shipping,
    });

    //ubah status kurir menjadi "unready"
    await CourierModel.update({ availability: "unready" }, { where: { courier_id: newOrder.courier_id } });

    // Buka koneksi WebSocket untuk customer dan kurir
    io.emit("orderCreated", {
        orderId: newOrder.id,
        customerId: currentUser.id,
        courierId: closestCourier.id,
    });


    return res.send({
        message: "Success",
        data: {
            order_id: newOrder.id,
            courier_id: newOrder.courier_id,
            total_price: totalPrice,
            items: orderItems.map((od) => ({
                product_id: od.product_id,
                quantity: od.quantity,
                price: parseFloat(od.price),
                subtotal: parseFloat(od.subtotal),
            })),
            shipping_cost: newShipping,
        },
    });
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const getOrderById = async(req, res, next) => {
    try {
        const { orderId } = req.params;

        // Temukan order berdasarkanorder_id
        const order = await OrderModel.findByPk(orderId, {
            include: [{
                    model: UserModel,
                    as: "couriers",
                    attributes: ["id", "name", "email", "phone_number", "latitude", "longitude"],
                    include: [{
                        model: CourierModel,
                        as: "courier"
                    }]
                },
                {
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
                {
                    model: HistoryModel,
                    as: "order_historie",
                },
                {
                    model: OrderItemModel,
                    as: "orderitem",
                    include: [{
                        model: ProductModel,
                        as: "product",
                        include: [{
                            model: UserModel,
                            as: "seller"
                        }]
                    }, ],
                },
            ],
        });

        // Jika order tidak ditemukan
        if (!order) {
            return res.status(404).send({ message: "Order not found" });
        }


        // Format data order untuk dikembalikan
        const totalQuantity = order.orderitem.reduce((acc, item) => acc + item.quantity, 0);

        const formattedOrder = {
            id: order.id,
            user_id: order.user_id,
            order_id: order.id,
            total: parseFloat(order.total_price),
            quantity: totalQuantity,
            status: order.status,
            order_code: order.order_code,
            order_date: order.order_date,
            payment_status: order.payment_status,
            payment_method: order.payment_method,
            address: order.shipping_cost ? order.shipping_cost.address : null,
            latitude: order.shipping_cost ? order.shipping_cost.latitude : null,
            longitude: order.shipping_cost ? order.shipping_cost.longitude : null,
            distance: order.shipping_cost ? order.shipping_cost.distance : null,
            created_at: order.created_at,
            customer: order.user,
            courier: {
                id: order.couriers.id,
                name: order.couriers.name,
                email: order.couriers.email,
                phone_number: order.couriers.phone_number,
                profile_image: order.couriers.profile_image,
                latitude: order.couriers.latitude,
                longitude: order.couriers.longitude,
                vehicle_type: order.couriers.courier ? order.couriers.courier.length > 0 ? order.couriers.courier[0].vehicle_type : null : null,
                vehicle_plate: order.couriers.courier ? order.couriers.courier.length > 0 ? order.couriers.courier[0].vehicle_plate : null : null,
            },
            order_history: order.order_historie.map((history) => ({
                id: history.id,
                order_id: history.order_id,
                user_id: history.user_id,
                status: history.status,
                note: history.note,
                created_at: history.createdAt,
                // latitude: history.order_historie.latitude,
                // longitude: history.order_historie.longitude,
                // vehicle_type: history.order_historie.courier ? history.order_historie.courier.length > 0 ? history.order_historie.courier[0].vehicle_type : null : null,
                // vehicle_plate: history.order_historie.courier ? history.order_historie.courier.length > 0 ? history.order_historie.courier[0].vehicle_plate : null : null,
            })),
            items: order.orderitem
                .map((item) => ({
                    product_id: item.product.id,
                    name: item.product.name,
                    description: item.product.description,
                    image_url: item.product.image_url,
                    price: parseFloat(item.product.price),
                    stock: item.product.stock,
                    quantity: item.quantity,
                    seller_id: item.product.seller.id,
                    seller_name: item.product.seller.name,
                    seller_profile_image: item.product.seller.profile_image,
                    seller_phone_number: item.product.seller.phone_number,
                    seller_email: item.product.seller.email,
                    seller_address: item.product.seller.address,
                    seller_latitude: item.product.seller.latitude,
                    seller_longitude: item.product.seller.longitude,
                })),
            shipping_cost: order.shipping_cost,
        };

        return res.send({
            message: "Success",
            data: formattedOrder,
        });
    } catch (error) {
        next(error);
    }
};



const cancelOrder = async(req, res, next) => {
    const { orderId } = req.params;

    try {
        const order = await OrderModel.findByPk(orderId, {
            include: {
                model: OrderItemModel,
                as: 'orderitem'
            }
        });

        if (!order) {
            return res.status(404).send({ message: "Orderan tidak ditemukan" });
        }

        // console.log("Status awal order:", order.status);

        if (order.status === "cancelled") {
            return res.status(400).send({ message: "Orderan sudah dibatalkan" });
        }

        const orderItem = order.orderitem;

        for (const item of orderItem) {
            const product = await ProductModel.findByPk(item.product_id);

            if (!product) {
                return res.status(404).send({ message: `Produk dengan ID ${item.product_id} tidak ditemukan` });
            }

            product.stock += item.quantity;
            await product.save();
        }

        await OrderModel.update({ status: "cancelled", payment_status: "cancelled" }, { where: { id: orderId } });

        // Periksa apakah pembaruan berhasil
        const updatedOrder = await OrderModel.findByPk(orderId);
        // console.log("Status order setelah pembaruan:", updatedOrder.status);

        return res.send({ message: "Order cancelled successfully" });
    } catch (error) {
        next(error);
    }
};




// /**
//  * @param {import("express").Request} req
//  * @param {import("express").Response} res
//  * @param {import("express").NextFunction} next
//  */
// const updateStatus = async(req, res, next) => {
//     const { orderId } = req.params;
//     const { status } = req.body;
//     const currentUser = req.user.id;

//     try {
//         const order = await OrderModel.findByPk(orderId);

//         if (!order) {
//             return res.status(404).send({ message: "Order not found" });
//         }

//         if (order.status == "cancelled") {
//             res.status(403).send({ message: "Order has been cancelled" });
//         }

//         await OrderModel.update({ status }, { where: { id: orderId } });

//         await HistoryModel.create({
//             order_id: orderId,
//             user_id: currentUser,
//             status,
//             note: `Orderan dalam keadaan ${status}`,
//         });


//         return res.send({ message: "Order status updated successfully" });
//     } catch (error) {
//         next(error);
//     }
// };

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
// const updateStatus = async(req, res, next) => {
//     const { orderId } = req.params;
//     const { status, note, availability } = req.body;
//     const currentUser = req.user.id;

//     if (!req.file) {
//         return res.status(400).send({ message: "Gambar tidak ditemukan, pastikan gambar diunggah dengan benar" });
//     }

//     const image = req.file.path; // Cloudinary URL
// console.log("ini image yang diupload", image)

//     // Mulai transaksi database
//     const transaction = await sequelize.transaction();

//     try {
//         // 1. Cari order berdasarkan orderId
//         const order = await OrderModel.findByPk(orderId, { transaction });

//         if (!order) {
//             await transaction.rollback();
//             return res.status(404).send({ message: "Order not found" });
//         }

//         // 2. Cek jika order sudah dibatalkan
//         if (order.status == "cancelled") {
//             await transaction.rollback();
//             return res.status(403).send({ message: "Order has been cancelled" });
//         }

//         // 3. Update status order
//         await OrderModel.update({
//             status,
//             purchase_receipt_photo: image,
//             delivery_receipt_photo: image,
//         }, { where: { id: orderId }, transaction });

//         // 4. Simpan history perubahan status
//         await HistoryModel.create({
//             order_id: orderId,
//             user_id: currentUser,
//             status,
//             note: note || `Orderan dalam keadaan ${status}`,
//         }, { transaction });

//         await CourierModel.update({ availability }, { where: { id: currentUser }, transaction });

//         // 5. Jika status adalah "delivered", simpan rating untuk setiap produk
//         if (status === "completed") {
//             // Ambil semua product_id dari tabel order_items
//             const orderItems = await OrderItemModel.findAll({
//                 where: { order_id: orderId },
//                 transaction,
//             });

//             // Simpan rating untuk setiap product_id ke tabel product_ratings
//             const ratingsData = orderItems.map((item) => ({
//                 order_id: orderId,
//                 user_id: currentUser,
//                 product_id: item.product_id,
//                 rating: null, // Nilai default (opsional)
//                 comment: null, // Komentar default (opsional)
//                 rating_time: new Date(),
//             }));
//             await ReviewModel.bulkCreate(ratingsData, { transaction });
//         }

//         // Commit transaksi jika semua berhasil
//         await transaction.commit();

//         return res.send({ message: "Order status updated successfully" });
//     } catch (error) {
//         // Rollback transaksi jika ada error
//         await transaction.rollback();
//         next(error);
//     }
// };

const updateStatus = async(req, res, next) => {
    const { orderId } = req.params;
    const { status, note, availability } = req.body;
    const currentUser = req.user;

    // console.log("ini current user dari payment", currentUser)

    // Mulai transaksi database
    const transaction = await sequelize.transaction();

    try {
        // 1. Cari order berdasarkan orderId
        const order = await OrderModel.findByPk(orderId, {
            include: [{
                    model: UserModel,
                    as: "couriers",
                    attributes: ["id", "name", "email", "phone_number", "latitude", "longitude"],
                    include: [{
                        model: CourierModel,
                        as: "courier"
                    }]
                },
                {
                    model: ShippingModel,
                    as: "shipping_cost",
                },
                {
                    model: PaymentModel,
                    as: "payment",
                },
                {
                    model: HistoryModel,
                    as: "order_historie",
                },
                {
                    model: OrderItemModel,
                    as: "orderitem",
                    include: [{
                        model: ProductModel,
                        as: "product",
                        include: [{
                            model: UserModel,
                            as: "seller"
                        }]
                    }, ],
                },
            ],
            transaction
        });

        if (!order) {
            await transaction.rollback();
            return res.status(404).send({ message: "Order not found" });
        }

        console.log("ini order", order)

        // 2. Cek jika order sudah dibatalkan
        if (order.status == "cancelled") {
            await transaction.rollback();
            return res.status(403).send({ message: "Order has been cancelled" });
        }

        // 3. Siapkan data untuk diupdate
        const updateData = { status };

        // Jika purchase_receipt_photo diupload, tambahkan ke updateData
        if (req.files && req.files.purchase_receipt_photo) {
            updateData.purchase_receipt_photo = req.files.purchase_receipt_photo[0].path;
        }

        // Jika delivery_receipt_photo diupload, tambahkan ke updateData
        if (req.files && req.files.delivery_receipt_photo) {
            updateData.delivery_receipt_photo = req.files.delivery_receipt_photo[0].path;
        }

        // 4. Update status order dan path foto (jika ada)
        await OrderModel.update(updateData, { where: { id: orderId }, transaction });

        // 5. Simpan history perubahan status
        await HistoryModel.create({
            order_id: orderId,
            user_id: currentUser.id,
            status,
            note: note || `Orderan dalam keadaan ${status}`,
        }, { transaction });

        // 6. Update availability kurir
        // if (currentUser.role === "courier") {
        // await CourierModel.update({ availability }, { where: { courier_id: currentUser.id }, transaction });
        // } else {
        //     await CourierModel.update({ availability }, { where: { courierId }, transaction });
        // }

        // 6. Update availability kurir berdasarkan role pengguna
        if (currentUser.role === "courier") {
            // Jika role courier, ambil courier_id dari user yang login
            await CourierModel.update({ availability }, { where: { courier_id: currentUser.id }, transaction });
        } else {
            // Jika role selain courier, ambil courier_id dari body
            // const { courier_id } = req.body;

            // if (!courier_id) {
            //     await transaction.rollback();
            //     return res.status(400).send({ message: "courier_id is required for non-courier users" });
            // }

            await CourierModel.update({ availability }, { where: { courier_id: order.courier_id }, transaction });
        }

        // 7. Jika status adalah "completed", simpan rating untuk setiap produk
        if (status === "completed") {
            // Ambil semua product_id dari tabel order_items
            const orderItems = await OrderItemModel.findAll({
                where: { order_id: orderId },
                transaction,
            });

            // Simpan rating untuk setiap product_id ke tabel product_ratings
            const ratingsData = orderItems.map((item) => ({
                order_id: orderId,
                user_id: currentUser.id,
                product_id: item.product_id,
                rating: null, // Nilai default (opsional)
                comment: null, // Komentar default (opsional)
                rating_time: new Date(),
            }));
            await ReviewModel.bulkCreate(ratingsData, { transaction });


        }
        // // Cek apakah ada history dengan note khusus untuk order ini
        // const earningsHistory = await HistoryModel.findOne({
        //     where: {
        //         order_id: orderId,
        //         note: 'Pesanan diterima Oleh yang bersangkutan'
        //     },
        //     transaction
        // });
        // const earningsHistoryCompleted = await HistoryModel.findOne({
        //     where: {
        //         order_id: orderId,
        //         note: 'Orderan dalam keadaan completed'
        //     },
        //     transaction
        // });

        // // Jika ada history dengan note tersebut
        // if (earningsHistory || earningsHistoryCompleted) {

        //     // Ambil semua item dari order
        //     const orderItems = order.orderitem; // Mengambil items dari order yang sudah di-include

        //     // Kelompokkan items berdasarkan seller_id dan hitung total amount per seller
        //     const sellerEarnings = {};

        //     orderItems.forEach((item) => {
        //         const sellerId = item.product.seller.id; // Ambil seller_id dari product
        //         const itemTotal = item.quantity * item.product.price; // Hitung total harga per item

        //         if (!sellerEarnings[sellerId]) {
        //             sellerEarnings[sellerId] = 0; // Inisialisasi jika seller belum ada di objek
        //         }

        //         sellerEarnings[sellerId] += itemTotal; // Tambahkan ke total pendapatan seller
        //     });

        //     // Simpan pendapatan untuk setiap seller
        //     for (const sellerId in sellerEarnings) {
        //         const totalAmount = sellerEarnings[sellerId]; // Total amount untuk seller
        //         const sellerEarning = totalAmount * 0.2; // 80% dari total amount

        //         await Seller_earningModel.create({
        //             order_id: orderId,
        //             seller_id: sellerId,
        //             amount: totalAmount, // Total harga produk berdasarkan seller
        //             seller_earning: sellerEarning, // 80% dari total amount
        //             earning_date: new Date(),
        //         }, { transaction });
        //     }

        //     // Hitung pendapatan kurir (20% dari shipping_cost)
        //     const courierEarning = order.shipping_cost[0].shipping_cost * 0.2;

        //     // Buat data pendapatan kurir
        //     await Courier_earningModel.create({
        //         order_id: orderId,
        //         courier_id: order.couriers.id,
        //         amount: order.shipping_cost[0].shipping_cost,
        //         courier_earning: courierEarning,
        //         earning_date: new Date(),
        //     }, { transaction });



        // }

        // Cek apakah ada history dengan note khusus untuk order ini
        // Cek apakah ada history dengan note khusus untuk order ini
        const earningsHistory = await HistoryModel.findOne({
            where: {
                order_id: orderId,
                note: 'Pesanan diterima Oleh yang bersangkutan'
            },
            transaction
        });

        const earningsHistoryCompleted = await HistoryModel.findOne({
            where: {
                order_id: orderId,
                note: 'Orderan dalam keadaan completed'
            },
            transaction
        });

        // Jika ada history dengan note tersebut
        if (earningsHistory || earningsHistoryCompleted) {
            // Cek apakah order_id sudah ada di Seller_earningModel atau Courier_earningModel
            const existingSellerEarning = await Seller_earningModel.findOne({
                where: { order_id: orderId },
                transaction
            });

            const existingCourierEarning = await Courier_earningModel.findOne({
                where: { order_id: orderId },
                transaction
            });

            // Jika belum ada data earning untuk order ini
            if (!existingSellerEarning && !existingCourierEarning) {
                // Ambil semua item dari order
                const orderItems = order.orderitem;

                // Kelompokkan items berdasarkan seller_id dan hitung total amount per seller
                const sellerEarnings = {};

                orderItems.forEach((item) => {
                    const sellerId = item.product.seller.id;
                    const itemTotal = item.quantity * item.product.price;

                    if (!sellerEarnings[sellerId]) {
                        sellerEarnings[sellerId] = 0;
                    }

                    sellerEarnings[sellerId] += itemTotal;
                });

                // Simpan pendapatan untuk setiap seller
                for (const sellerId in sellerEarnings) {
                    const totalAmount = sellerEarnings[sellerId];
                    const sellerEarning = totalAmount * 0.2;

                    await Seller_earningModel.create({
                        order_id: orderId,
                        seller_id: sellerId,
                        amount: totalAmount,
                        seller_earning: sellerEarning,
                        earning_date: new Date(),
                    }, { transaction });
                }

                // Hitung pendapatan kurir (20% dari shipping_cost)
                const courierEarning = order.shipping_cost[0].shipping_cost * 0.2;

                // Buat data pendapatan kurir
                await Courier_earningModel.create({
                    order_id: orderId,
                    courier_id: order.couriers.id,
                    amount: order.shipping_cost[0].shipping_cost,
                    courier_earning: courierEarning,
                    earning_date: new Date(),
                }, { transaction });
            }
        }

        // Commit transaksi jika semua berhasil
        await transaction.commit();
        return res.send({ message: "Order status updated successfully" });
    } catch (error) {
        // Rollback transaksi jika ada error
        await transaction.rollback();
        next(error);
    }
};


/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */

const updateCourierLocation = async(req, res, next) => {
    const { latitude, longitude } = req.body;
    const courierId = req.user.id; // ID kurir yang sedang login
    // const { orderId } = req.params

    try {
        // Validasi data
        if (!latitude || !longitude) {
            return res.status(400).send({ message: "Order ID, latitude, dan longitude harus diisi" });
        }

        // Update lokasi kurir di database
        await UserModel.update({ latitude, longitude }, { where: { id: courierId } });
        const address = await reverseGeocode(latitude, longitude);

        // Kirim update lokasi ke customer melalui WebSocket
        io.emit("locationUpdated", {
            // orderId,
            courierId,
            address,
            latitude,
            longitude,
        });

        return res.send({ message: "Lokasi kurir berhasil diperbarui" });
    } catch (error) {
        console.error("Error updating courier location:", error);
        return res.status(500).send({ message: "Terjadi kesalahan saat memperbarui lokasi kurir" });
    }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */

const updateCourierAvailability = async(req, res, next) => {
    const { courierId } = req.body;
    // const { orderId } = req.params

    try {
        if (!courierId) {
            return res.status(400).send({ message: "Kurir tidak ditemukan atau tidak menyertakan ID kurirnya" });
        }
        // Update lokasi kurir di database
        await CourierModel.update({ availability: 'ready' }, { where: { courier_id: courierId } });

        return res.send({ message: "Availability kurir telah diupdate" });
    } catch (error) {
        console.error("Error updating courier availability:", error);
        return res.status(500).send({ message: "Terjadi kesalahan saat memperbarui availability kurir" });
    }
};


module.exports = { index, indexCourier, create, getOrderById, cancelOrder, updateStatus, updateCourierLocation, updateCourierAvailability };