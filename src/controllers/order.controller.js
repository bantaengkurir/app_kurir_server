const {
    courier: CourierModel,
    user: UserModel,
    order: OrderModel,
    product: ProductModel,
    variant: VariantModel,
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

const admin = require("firebase-admin");
const serviceAccount = require('../config/banteng-dessert-firebase-adminsdk-fbsvc-6c15cc34fd.json');

const axios = require('axios');
const order = require("../models/order");
const { Op } = require('sequelize');
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

        const orders = await OrderModel.findAll({
            where: whereCondition, // Gunakan kondisi where yang sudah ditentukan
            include: [{
                    model: UserModel,
                    as: "couriers",
                    attributes: ["id", "name", "email", "profile_image", "phone_number", "latitude", "longitude"],
                    include: [{
                            model: CourierModel,
                            as: "courier"
                        },
                        {
                            model: CourierRatingModel,
                            as: "courier_rating"
                        }
                    ]
                },
                {
                    model: UserModel,
                    as: "user",
                    attributes: ["id", "name", "email", "profile_image", "phone_number", "latitude", "longitude"],
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
                        model: VariantModel,
                        as: "variant",
                        include: [{
                            model: ProductModel,
                            as: "product",
                            include: [{
                                model: UserModel,
                                as: "seller"
                            }]
                        }]
                    }],
                },
                {
                    model: HistoryModel,
                    as: "order_historie",
                }
            ],
        });

        // Kumpulkan semua product_id unik
        const allProductIds = [];
        orders.forEach(order => {
            order.orderitem.forEach(item => {
                if (item.variant && item.variant.product) {
                    allProductIds.push(item.variant.product.id);
                }
            });
        });

        // Hitung rata-rata rating per produk (asumsi ada model Review)
        const productRatings = {};
        if (allProductIds.length > 0) {
            const avgRatings = await ReviewModel.findAll({
                attributes: [
                    'variant_id', [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']
                ],
                where: { variant_id: allProductIds },
                group: ['variant_id']
            });

            avgRatings.forEach(rating => {
                productRatings[rating.variant_id] = parseFloat(rating.get('avg_rating'));
            });
        }

        // Kumpulkan courier_ids untuk rating kurir
        const courierIds = orders
            .filter(order => order.couriers)
            .map(order => order.couriers.id);
        const uniqueCourierIds = [...new Set(courierIds)];

        const courierAvgRatings = {};
        if (uniqueCourierIds.length > 0) {
            const avgResults = await CourierRatingModel.findAll({
                attributes: [
                    'courier_id', [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']
                ],
                where: { courier_id: uniqueCourierIds },
                group: ['courier_id']
            });

            avgResults.forEach(result => {
                courierAvgRatings[result.courier_id] = parseFloat(result.get('avg_rating'));
            });
        }



        const formattedOrders = orders
            .map((order) => {
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
                    address: order.shipping_cost && order.shipping_cost.length > 0 ? order.shipping_cost[0].address : null,
                    latitude: order.shipping_cost && order.shipping_cost.length > 0 ? order.shipping_cost[0].latitude : null,
                    longitude: order.shipping_cost && order.shipping_cost.length > 0 ? order.shipping_cost[0].longitude : null,
                    distance: order.shipping_cost && order.shipping_cost.length > 0 ? order.shipping_cost[0].distance : null,
                    created_at: order.createdAt,
                    user: order.user,
                    courier: {
                        id: order.couriers.id,
                        name: order.couriers.name,
                        email: order.couriers.email,
                        profile_image: order.couriers.profile_image,
                        phone_number: order.couriers.phone_number,
                        latitude: order.couriers.latitude,
                        longitude: order.couriers.longitude,
                        vehicle_type: order.couriers.courier && order.couriers.courier.length > 0 ?
                            order.couriers.courier[0].vehicle_type : null,
                        vehicle_plate: order.couriers.courier && order.couriers.courier.length > 0 ?
                            order.couriers.courier[0].vehicle_plate : null,
                        courier_average_rating: courierAvgRatings[order.couriers.id] || null
                    },
                    items: order.orderitem.map((item) => {

                        const variantId = item.variant && item.variant.product ? item.variant.product.id : null;
                        return {
                            order_id: item.order_id,
                            quantity: item.quantity,
                            variant_id: item.variant_id,
                            product_id: item.variant ? item.variant.product_id : null,
                            name: item.variant ? item.variant.name : null,
                            img_url: item.variant ? item.variant.img_url : null,
                            price: item.variant ? item.variant.price : null,
                            sku: item.variant ? item.variant.sku : null,
                            stock: item.variant ? item.variant.stock : null,
                            product_name: item.variant && item.variant.product ? item.variant.product.name : null,
                            product_description: item.variant && item.variant.product ? item.variant.product.description : null,
                            product_image_url: item.variant && item.variant.product ? item.variant.product.image_url : null,
                            product_stock: item.variant && item.variant.product ? item.variant.product.stock : null,
                            // product_rating: item.variant && item.variant.product ? item.variant.product.rating : null,
                            product_average_rating: variantId ? (productRatings[variantId] || null) : null,
                            product_total_sold: item.variant && item.variant.product ? item.variant.product.total_sold : null,
                            product_category: item.variant && item.variant.product ? item.variant.product.category : null,
                            seller_id: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.id : null,
                            seller_name: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.name : null,
                            seller_address: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.address : null,
                            seller_latitude: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.latitude : null,
                            seller_longitude: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.longitude : null,
                            seller_profile_image: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.profile_image : null,
                            seller_phone_number: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.phone_number : null
                        }
                    }),
                    shipping_cost: order.shipping_cost || [],
                    order_historie: order.order_historie || []
                }
            });


        return res.send({
            message: "Success",
            data: formattedOrders,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
}


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
                        },
                        {
                            model: CourierRatingModel,
                            as: "courier_rating"
                        }
                    ]
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
                        model: VariantModel,
                        as: "variant",
                        include: [{
                            model: ProductModel,
                            as: "product",
                            include: [{
                                model: UserModel,
                                as: "seller"
                            }]
                        }]
                    }],
                },
            ],
        });

        // Kumpulkan semua product_id unik
        const allProductIds = [];
        orders.forEach(order => {
            order.orderitem.forEach(item => {
                if (item.variant && item.variant.product) {
                    allProductIds.push(item.variant.product.id);
                }
            });
        });

        // Hitung rata-rata rating per produk (asumsi ada model Review)
        const productRatings = {};
        if (allProductIds.length > 0) {
            const avgRatings = await ReviewModel.findAll({
                attributes: [
                    'variant_id', [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']
                ],
                where: { variant_id: allProductIds },
                group: ['variant_id']
            });

            avgRatings.forEach(rating => {
                productRatings[rating.variant_id] = parseFloat(rating.get('avg_rating'));
            });
        }

        // Kumpulkan courier_ids untuk rating kurir
        const courierIds = orders
            .filter(order => order.couriers)
            .map(order => order.couriers.id);
        const uniqueCourierIds = [...new Set(courierIds)];

        const courierAvgRatings = {};
        if (uniqueCourierIds.length > 0) {
            const avgResults = await CourierRatingModel.findAll({
                attributes: [
                    'courier_id', [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']
                ],
                where: { courier_id: uniqueCourierIds },
                group: ['courier_id']
            });

            avgResults.forEach(result => {
                courierAvgRatings[result.courier_id] = parseFloat(result.get('avg_rating'));
            });
        }


        const formattedOrders = orders.map((order) => {
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
                address: order.shipping_cost && order.shipping_cost.length > 0 ? order.shipping_cost[0].address : null,
                latitude: order.shipping_cost && order.shipping_cost.length > 0 ? order.shipping_cost[0].latitude : null,
                longitude: order.shipping_cost && order.shipping_cost.length > 0 ? order.shipping_cost[0].longitude : null,
                distance: order.shipping_cost && order.shipping_cost.length > 0 ? order.shipping_cost[0].distance : null,
                created_at: order.createdAt,
                courier: {
                    id: order.couriers.id,
                    name: order.couriers.name,
                    email: order.couriers.email,
                    profile_image: order.couriers.profile_image,
                    phone_number: order.couriers.phone_number,
                    latitude: order.couriers.latitude,
                    longitude: order.couriers.longitude,
                    vehicle_type: order.couriers.courier && order.couriers.courier.length > 0 ?
                        order.couriers.courier[0].vehicle_type : null,
                    vehicle_plate: order.couriers.courier && order.couriers.courier.length > 0 ?
                        order.couriers.courier[0].vehicle_plate : null,
                    courier_average_rating: courierAvgRatings[order.couriers.id] || null
                },
                items: order.orderitem.map((item) => {
                    const variantId = item.variant && item.variant.product ? item.variant.product.id : null;
                    return {
                        order_id: item.order_id,
                        quantity: item.quantity,
                        variant_id: item.variant_id,
                        product_id: item.variant ? item.variant.product_id : null,
                        name: item.variant ? item.variant.name : null,
                        img_url: item.variant ? item.variant.img_url : null,
                        price: item.variant ? item.variant.price : null,
                        sku: item.variant ? item.variant.sku : null,
                        stock: item.variant ? item.variant.stock : null,
                        product_name: item.variant && item.variant.product ? item.variant.product.name : null,
                        product_description: item.variant && item.variant.product ? item.variant.product.description : null,
                        product_image_url: item.variant && item.variant.product ? item.variant.product.image_url : null,
                        product_stock: item.variant && item.variant.product ? item.variant.product.stock : null,
                        product_average_rating: variantId ? (productRatings[variantId] || null) : null,
                        product_total_sold: item.variant && item.variant.product ? item.variant.product.total_sold : null,
                        product_category: item.variant && item.variant.product ? item.variant.product.category : null,
                        seller_id: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.id : null,
                        seller_name: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.name : null,
                        seller_address: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.address : null,
                        seller_latitude: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.latitude : null,
                        seller_longitude: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.longitude : null,
                        seller_profile_image: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.profile_image : null,
                        seller_phone_number: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.phone_number : null
                    }
                }),
                shipping_cost: order.shipping_cost || []
            }
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


//! Tanpa perhitungan jarak dari seller kekurir dan dari kurir ke user
// const create = async(req, res, next) => {
//     const { items, payment_method, shipping_cost } = req.body;
//     const { latitude, longitude } = shipping_cost || {};
//     const currentUser = req.user;


//     const idOrder = items.map((item) => item.variant_id);

//     if (idOrder.length === 0) {
//         return res.status(400).send({ message: "Data tidak ditemukan" });
//     }

//     if (!currentUser || !currentUser.id) {
//         return res.status(401).send({ message: "User tidak terautentikasi" });
//     }

//     // Ambil produk beserta seller
//     const variants = await VariantModel.findAll({
//         where: {
//             id: idOrder,
//         },
//         include: [{
//             model: ProductModel,
//             as: 'product',
//             include: [{
//                 model: UserModel,
//                 as: 'seller',
//                 attributes: ['id', 'latitude', 'longitude']
//             }]
//         }]
//     });

//     if (variants.length !== idOrder.length) {
//         return res.status(400).send({ message: "Satu atau lebih produk tidak ditemukan" });
//     }

//     // Kelompokkan produk berdasarkan seller
//     const sellers = variants.reduce((acc, variant) => {
//         const sellerId = variant.product.seller.id;
//         if (!acc[sellerId]) {
//             acc[sellerId] = {
//                 seller: variant.product.seller,
//                 variants: []
//             };
//         }
//         acc[sellerId].variants.push(variant);
//         return acc;
//     }, {});

//     const sellerGroups = Object.values(sellers);

//     // Validasi lokasi semua seller
//     for (const group of sellerGroups) {
//         const seller = group.seller;
//         if (!seller || !seller.latitude || !seller.longitude) {
//             return res.status(400).send({ message: "Lokasi seller tidak valid" });
//         }
//     }

//     // Generate order code
//     let code;
//     for (let i = 0; i < variants.length; i++) {
//         if (variants[i].status === "makanan") {
//             code = "01" + Math.floor(Math.random() * 1000000);
//         } else if (variants[i].status === "minuman") {
//             code = "02" + Math.floor(Math.random() * 1000000);
//         } else {
//             code = "03" + Math.floor(Math.random() * 1000000);
//         }
//     }

//     // Pilih kurir yang online dan statusnya "ready"
//     const couriers = await UserModel.findAll({
//         where: {
//             role: "courier",
//             status: "online",
//         },
//         attributes: ['id', 'latitude', 'longitude']
//     });

//     if (couriers.length === 0) {
//         return res.status(400).send({ message: "Tidak ada courier yang tersedia" });
//     }
//     // const courierReady = await UserModel.findAll({
//     //     where: {
//     //         role: "courier",
//     //     },
//     //     include: [{
//     //         model: CourierModel,
//     //         as: "courier", // Pastikan sesuai dengan relasi yang didefinisikan
//     //         where: {
//     //             availability: "ready", // ✅ Filter berdasarkan availability di tabel Courier
//     //         },
//     //         required: true, // INNER JOIN (hambil User yang punya relasi Courier)
//     //     }],
//     //     attributes: ['id', 'latitude', 'longitude'],
//     // });
//     const courierReady = await UserModel.findAll({
//         where: {
//             role: "courier",
//             status: "online", // ✅ Hanya kurir yang online
//         },
//         include: [{
//             model: CourierModel,
//             as: "courier",
//             where: {
//                 availability: "ready", // ✅ Hanya yang availability = ready
//                 order_status: "free", // ✅ Hanya yang tidak sedang mengantar (free)
//             },
//             required: true, // ✅ Pastikan INNER JOIN (hanya user yang punya data courier)
//         }],
//         attributes: ['id', 'latitude', 'longitude'], // Ambil data yang diperlukan
//     });

//     if (courierReady.length === 0) {
//         return res.status(400).send({ message: "Tidak ada kurir yang siap mengantar" });
//     }

//     if (courierReady.length === 0) {
//         return res.status(400).send({ message: "Tidak ada courier yang ready" });
//     }


//     // Fungsi hitung jarak jalan
//     const getRoadDistance = async(origin, destination) => {
//         const apiKey = process.env.API_KEY_GEOCODING_MAPS;
//         const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${apiKey}`;

//         try {
//             const response = await axios.get(url);
//             if (response.data.rows[0].elements[0].status === "OK") {
//                 return response.data.rows[0].elements[0].distance.value;
//             }
//             throw new Error("Jarak tidak ditemukan");
//         } catch (error) {
//             console.error("Error calculating road distance:", error);
//             throw new Error("Gagal menghitung jarak");
//         }
//     };

//     // Hitung total jarak ke semua seller
//     let totalDistance = 0;
//     try {
//         const userLocation = { latitude, longitude };
//         const distancePromises = sellerGroups.map(async(group) => {
//             return await getRoadDistance(userLocation, {
//                 latitude: group.seller.latitude,
//                 longitude: group.seller.longitude
//             });
//         });

//         const distances = await Promise.all(distancePromises);
//         totalDistance = distances.reduce((sum, dist) => sum + dist, 0);
//     } catch (error) {
//         return res.status(500).send({ message: error.message });
//     }

//     // Hitung biaya pengiriman
//     let shipping = 0;
//     if (totalDistance <= 1000) {
//         shipping = 5000;
//     } else {
//         const additionalDistance = totalDistance - 1000;
//         const additionalKm = additionalDistance / 1000; // Pembulatan ke atas untuk km selanjutnya
//         shipping = 5000 + additionalKm * 1500;
//     }
//     shipping = Math.round(shipping);

//     // Pilih kurir terdekat ke user
//     // let closestCourier = null;
//     // let minDistance = Infinity;
//     // for (const courier of couriers) {
//     //     const courierDistance = geolib.getDistance({ latitude, longitude }, { latitude: courier.latitude, longitude: courier.longitude });
//     //     if (courierDistance < minDistance) {
//     //         minDistance = courierDistance;
//     //         closestCourier = courier;
//     //     }
//     // }

//     // if (!closestCourier) {
//     //     return res.status(400).send({ message: "Tidak ada courier dalam jangkauan" });
//     // }

//     //! Pilih kurir terdekat ke user
//     // let closestCourier = null;
//     // let minDistance = Infinity;
//     // for (const courier of courierReady) { // Gunakan courierReady yang sudah difilter
//     //     const courierDistance = geolib.getDistance({ latitude, longitude }, { latitude: courier.latitude, longitude: courier.longitude });

//     //     // Konversi jarak dari meter ke kilometer
//     //     const distanceInKm = courierDistance / 1000;


//     //     // Jika jarak lebih dari 10 km, skip kurir ini
//     //     if (distanceInKm >= 10) continue;

//     //     if (courierDistance < minDistance) {
//     //         minDistance = courierDistance;
//     //         closestCourier = courier;
//     //     }
//     // }

//     // if (!closestCourier) {
//     //     return res.status(400).send({ message: "Tidak ada courier dalam jangkauan (semua kurir lebih dari 10 km)" });
//     // }

//     // Pilih kurir yang paling dekat dengan salah satu seller
//     let closestCourier = null;
//     let minDistance = Infinity;

//     for (const courier of courierReady) {
//         // Hitung jarak kurir ke setiap seller
//         for (const group of sellerGroups) {
//             const seller = group.seller;
//             const courierDistance = geolib.getDistance({ latitude: seller.latitude, longitude: seller.longitude }, { latitude: courier.latitude, longitude: courier.longitude });

//             // Konversi jarak ke kilometer
//             const distanceInKm = courierDistance / 1000;

//             // Cek apakah kurir dalam radius 10 km dari seller ini
//             if (distanceInKm <= 10) {
//                 // Jika jarak lebih pendek dari minDistance, update kurir terdekat
//                 if (courierDistance < minDistance) {
//                     minDistance = courierDistance;
//                     closestCourier = courier;
//                 }
//             }
//         }
//     }

//     if (!closestCourier) {
//         return res.status(400).send({
//             message: "Tidak ada kurir dalam 10 km dari toko manapun"
//         });
//     }


//     // Buat order
//     const newOrder = await OrderModel.create({
//         user_id: currentUser.id,
//         courier_id: closestCourier.id,
//         order_date: new Date(),
//         payment_method,
//         order_code: code,
//     });

//     // Hitung total harga
//     let totalPrice = 0;
//     const orderItems = items.map((item) => {
//         const variant = variants.find((b) => b.id === item.variant_id);
//         const subtotal = variant.price * item.quantity;
//         totalPrice += subtotal;

//         return {
//             order_id: newOrder.id,
//             courier_id: newOrder.courier_id,
//             variant_id: item.variant_id,
//             quantity: item.quantity,
//             price: variant.price,
//             subtotal: subtotal,
//         };
//     });

//     await OrderItemModel.bulkCreate(orderItems);

//     await OrderModel.update({
//         total_price: totalPrice,
//         status: "Pending",
//     }, {
//         where: { id: newOrder.id },
//     });

//     // Buat data pengiriman
//     const address = await reverseGeocode(latitude, longitude);
//     const newShipping = await ShippingModel.create({
//         order_id: newOrder.id,
//         address,
//         latitude,
//         longitude,
//         distance: totalDistance,
//         shipping_cost: shipping,
//     });

//     //ubah status kurir menjadi "unready"
//     await CourierModel.update({ availability: "unready" }, { where: { courier_id: newOrder.courier_id } });

//     // Buka koneksi WebSocket untuk customer dan kurir
//     io.emit("orderCreated", {
//         orderId: newOrder.id,
//         customerId: currentUser.id,
//         courierId: closestCourier.id,
//     });


//     return res.send({
//         message: "Success",
//         data: {
//             order_id: newOrder.id,
//             user_id: currentUser.id,
//             courier_id: newOrder.courier_id,
//             total_price: totalPrice,
//             items: orderItems.map((od) => ({
//                 variant_id: od.variant_id,
//                 quantity: od.quantity,
//                 price: parseFloat(od.price),
//                 subtotal: parseFloat(od.subtotal),
//             })),
//             shipping_cost: newShipping,
//         },
//     });
// };


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Fungsi untuk mengirim notifikasi FCM ke kurir
const sendFCMPushNotification = async(courierId, message, orderData = null) => {
    try {
        // Dapatkan data kurir + token
        const courier = await UserModel.findByPk(courierId, {
            attributes: ['fcm_token'],
            include: [{
                model: CourierModel,
                as: 'courier',
                attributes: ['id']
            }]
        });

        if (!courier.fcm_token) {
            console.log(`Kurir ${courierId} tidak memiliki FCM token`);
            return null;
        }


        // Gunakan payload khusus untuk Android
        const payload = {
            data: {
                title: 'Pesanan Baru!',
                body: message,
                type: 'new-order',
                ...(orderData && { order: JSON.stringify(orderData) }),
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            },
            android: {
                priority: 'high', // Prioritas tinggi untuk offline
                ttl: 60 * 60 * 24, // 24 jam masa hidup
            },
            token: courier.fcm_token
        };

        // Kirim dengan konfigurasi khusus
        const response = await admin.messaging().send(payload);
        console.log('Notifikasi FCM berhasil dikirim:', response);
        return response;
    } catch (error) {
        console.error('Error sending FCM notification:', error);
        throw error;
    }
};

// Fungsi untuk memilih kurir dengan timeout
const selectCourierWithTimeout = async(sellerGroups) => {
    // 1. Cari kurir ONLINE yang ready dan punya token FCM
    let courierReady = await UserModel.findAll({
        where: {
            role: "courier",
            status: "online",
            fcm_token: {
                [Op.ne]: null
            }
        },
        include: [{
            model: CourierModel,
            as: "courier",
            where: {
                availability: "ready",
                order_status: "free"
            },
            required: true,
        }],
        attributes: ['id', 'latitude', 'longitude', 'fcm_token'],
    });

    let closestCourier = findClosestCourier(courierReady, sellerGroups);
    if (closestCourier) return closestCourier;

    // 2. Jika tidak ada online, cari offline yang ready dan punya token
    const courierOffline = await UserModel.findAll({
        where: {
            role: "courier",
            status: "offline",
            fcm_token: {
                [Op.ne]: null
            }
        },
        include: [{
            model: CourierModel,
            as: "courier",
            where: {
                availability: "ready",
                order_status: "free"
            },
            required: true,
        }],
        attributes: ['id', 'latitude', 'longitude', 'fcm_token'],
    });

    closestCourier = findClosestCourier(courierOffline, sellerGroups);
    if (!closestCourier) {
        throw new Error('Tidak ada kurir yang tersedia');
    }

    // 3. Kirim notifikasi FCM dan tunggu 30 detik
    await sendFCMPushNotification(
        closestCourier.id,
        'Ada pesanan baru menunggu! Silakan online dalam 30 detik untuk menerima.'
    );

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            clearInterval(interval);
            reject(new Error('Tidak ada kurir yang tersedia'));
        }, 30000); // 30 detik timeout

        const interval = setInterval(async() => {
            const updatedCourier = await UserModel.findOne({
                where: {
                    id: closestCourier.id,
                    status: "online"
                },
                include: [{
                    model: CourierModel,
                    as: "courier",
                    where: {
                        availability: "ready",
                        order_status: "free"
                    },
                    required: true,
                }],
            });

            if (updatedCourier) {
                clearTimeout(timeout);
                clearInterval(interval);
                resolve(updatedCourier);
            }
        }, 1000); // Cek setiap 1 detik
    });
};

// Fungsi mencari kurir terdekat
const findClosestCourier = (couriers, sellerGroups) => {
    let closestCourier = null;
    let minDistance = Infinity;

    for (const courier of couriers) {
        for (const group of sellerGroups) {
            const seller = group.seller;
            const courierDistance = geolib.getDistance({ latitude: seller.latitude, longitude: seller.longitude }, { latitude: courier.latitude, longitude: courier.longitude });
            const distanceInKm = courierDistance / 1000;

            if (distanceInKm <= 10 && courierDistance < minDistance) {
                minDistance = courierDistance;
                closestCourier = courier;
            }
        }
    }
    return closestCourier;
};

// Controller untuk membuat order
const create = async(req, res, next) => {
    try {
        const { items, payment_method, shipping_cost } = req.body;
        const { latitude, longitude } = shipping_cost || {};
        const currentUser = req.user;

        // Validasi awal
        if (!items || items.length === 0) {
            return res.status(400).send({ message: "Data tidak ditemukan" });
        }

        if (!currentUser || !currentUser.id) {
            return res.status(401).send({ message: "User tidak terautentikasi" });
        }

        // Ambil produk beserta seller
        const variants = await VariantModel.findAll({
            where: { id: items.map(item => item.variant_id) },
            include: [{
                model: ProductModel,
                as: 'product',
                include: [{
                    model: UserModel,
                    as: 'seller',
                    attributes: ['id', 'latitude', 'longitude']
                }]
            }]
        });

        if (variants.length !== items.length) {
            return res.status(400).send({ message: "Satu atau lebih produk tidak ditemukan" });
        }

        // Kelompokkan produk berdasarkan seller
        const sellers = variants.reduce((acc, variant) => {
            const sellerId = variant.product.seller.id;
            if (!acc[sellerId]) {
                acc[sellerId] = {
                    seller: variant.product.seller,
                    variants: []
                };
            }
            acc[sellerId].variants.push(variant);
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
        const code = "01" + Math.floor(Math.random() * 1000000);

        // Pilih kurir
        const closestCourier = await selectCourierWithTimeout(sellerGroups);


        // Buat order
        const newOrder = await OrderModel.create({
            user_id: currentUser.id,
            courier_id: closestCourier.id,
            order_date: new Date(),
            payment_method,
            order_code: code,
        });

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

        // Hitung total harga
        let totalPrice = 0;
        let totalItems = 0;
        const orderItems = items.map((item) => {
            const variant = variants.find((b) => b.id === item.variant_id);
            const subtotal = variant.price * item.quantity;
            totalPrice += subtotal;
            totalItems += item.quantity;
            return {
                order_id: newOrder.id,
                courier_id: newOrder.courier_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: variant.price,
                subtotal: subtotal,
            };
        });

        if (totalDistance > 10000) {
            return res.status(400).send({ message: "Tidak ada kurir yang tersedia di sekitar lokasi Anda" });
        }

        await OrderItemModel.bulkCreate(orderItems);

        await OrderModel.update({
            total_price: totalPrice,
            status: "Pending",
        }, {
            where: { id: newOrder.id },
        });

        // Hitung biaya pengiriman berdasarkan kondisi
        let finalShippingCost;
        if (totalDistance <= 100) {
            // Prioritas 1: Gratis untuk jarak sangat dekat
            finalShippingCost = 0;
        } else if (totalDistance <= 2000 && totalItems >= 3) {
            // Prioritas 2: Gratis untuk jarak dekat + banyak item
            finalShippingCost = 0;
        } else if (totalDistance <= 500 && totalItems <= 3) { // Koreksi: 500 bukan 5000
            // Biaya flat untuk jarak sangat dekat + sedikit item
            finalShippingCost = 3000;
        } else {
            // Biaya standar akan dihitung dalam pembuatan shipping
            finalShippingCost = null; // Akan diisi dari newShipping.shipping_cost
        }

        // Buat data pengiriman
        const address = await reverseGeocode(latitude, longitude);
        const newShipping = await ShippingModel.create({
            order_id: newOrder.id,
            address,
            latitude,
            longitude,
            distance: totalDistance,
            shipping_cost: finalShippingCost !== null ? finalShippingCost : shipping, // Gunakan nilai yang sesuai
        });

        // Jika finalShippingCost null, ambil nilai dari newShipping
        const actualShippingCost = finalShippingCost !== null ? finalShippingCost : newShipping.shipping_cost;

        // Update status kurir menjadi "unready"
        await CourierModel.update({ availability: "unready" }, { where: { courier_id: newOrder.courier_id } });

        // Kirim notifikasi via WebSocket
        io.emit("orderCreated", {
            orderId: newOrder.id,
            customerId: currentUser.id,
            courierId: closestCourier.id,
        });

        // Response ke client
        return res.send({
            message: "Success",
            data: {
                order_id: newOrder.id,
                order_code: newOrder.order_code,
                total_price: totalPrice,
                shipping_cost: actualShippingCost, // Gunakan nilai yang sudah dikoreksi
                items: orderItems,
            },
        });
        // // Buat data pengiriman
        // const address = await reverseGeocode(latitude, longitude);
        // const newShipping = await ShippingModel.create({
        //     order_id: newOrder.id,
        //     address,
        //     latitude,
        //     longitude,
        //     distance: totalDistance,
        //     shipping_cost: shipping,
        // });

        // //ubah status kurir menjadi "unready"
        // await CourierModel.update({ availability: "unready" }, { where: { courier_id: newOrder.courier_id } });

        // // Buka koneksi WebSocket untuk customer dan kurir
        // io.emit("orderCreated", {
        //     orderId: newOrder.id,
        //     customerId: currentUser.id,
        //     courierId: closestCourier.id,
        // });

        // // // Hitung total harga dan buat order items
        // // let totalPrice = 0;
        // // const orderItems = items.map((item) => {
        // //     const variant = variants.find(v => v.id === item.variant_id);
        // //     const subtotal = variant.price * item.quantity;
        // //     totalPrice += subtotal;

        // //     return {
        // //         order_id: newOrder.id,
        // //         courier_id: newOrder.courier_id,
        // //         variant_id: item.variant_id,
        // //         quantity: item.quantity,
        // //         price: variant.price,
        // //         subtotal: subtotal,
        // //     };
        // // });

        // // await OrderItemModel.bulkCreate(orderItems);
        // // await OrderModel.update({ total_price: totalPrice }, { where: { id: newOrder.id } });

        // // // Buat data pengiriman
        // // const address = await reverseGeocode(latitude, longitude);
        // // const newShipping = await ShippingModel.create({
        // //     order_id: newOrder.id,
        // //     address,
        // //     latitude,
        // //     longitude,
        // //     shipping_cost: calculateShippingCost(latitude, longitude, sellerGroups),
        // // });

        // // // Update status kurir
        // // await CourierModel.update({ availability: "unready" }, { where: { courier_id: closestCourier.id } });

        // // // Kirim notifikasi ke kurir
        // // const orderDetails = {
        // //     id: newOrder.id,
        // //     code: newOrder.order_code,
        // //     total: totalPrice,
        // //     address: address,
        // //     items: items.map(item => ({
        // //         name: variants.find(v => v.id === item.variant_id).name,
        // //         quantity: item.quantity
        // //     }))
        // // };

        // // await sendFCMPushNotification(
        // //     closestCourier.id,
        // //     `Pesanan #${newOrder.order_code} telah ditugaskan ke Anda`,
        // //     orderDetails
        // // );

        // // // Kirim event via WebSocket
        // // io.emit("orderCreated", {
        // //     orderId: newOrder.id,
        // //     customerId: currentUser.id,
        // //     courierId: closestCourier.id,
        // // });

        // return res.send({
        //     message: "Success",
        //     data: {
        //         order_id: newOrder.id,
        //         order_code: newOrder.order_code,
        //         total_price: totalPrice,
        //         shipping_cost: newShipping.shipping_cost,
        //         items: orderItems
        //     },
        // });

    } catch (error) {
        console.error('Error in order creation:', error);
        return res.status(400).send({ message: error.message });
    }
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
                        model: VariantModel,
                        as: "variant",
                        include: [{
                            model: ProductModel,
                            as: "product",
                            include: [{
                                model: UserModel,
                                as: "seller"
                            }]
                        }]
                    }],
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
                    order_id: item.order_id,
                    quantity: item.quantity,
                    variant_id: item.variant_id,
                    product_id: item.variant ? item.variant.product_id : null,
                    name: item.variant ? item.variant.name : null,
                    img_url: item.variant ? item.variant.img_url : null,
                    price: item.variant ? item.variant.price : null,
                    sku: item.variant ? item.variant.sku : null,
                    stock: item.variant ? item.variant.stock : null,
                    product_name: item.variant && item.variant.product ? item.variant.product.name : null,
                    product_description: item.variant && item.variant.product ? item.variant.product.description : null,
                    product_image_url: item.variant && item.variant.product ? item.variant.product.image_url : null,
                    product_stock: item.variant && item.variant.product ? item.variant.product.stock : null,
                    product_rating: item.variant && item.variant.product ? item.variant.product.rating : null,
                    product_total_sold: item.variant && item.variant.product ? item.variant.product.total_sold : null,
                    product_category: item.variant && item.variant.product ? item.variant.product.category : null,
                    seller_id: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.id : null,
                    seller_name: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.name : null,
                    seller_address: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.address : null,
                    seller_latitude: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.latitude : null,
                    seller_longitude: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.longitude : null,
                    seller_profile_image: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.profile_image : null,
                    seller_phone_number: item.variant && item.variant.product && item.variant.product.seller ? item.variant.product.seller.phone_number : null
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


        if (order.status === "cancelled") {
            return res.status(400).send({ message: "Orderan sudah dibatalkan" });
        }

        const orderItem = order.orderitem;

        for (const item of orderItem) {
            const variant = await VariantModel.findByPk(item.variant_id);

            if (!variant) {
                return res.status(404).send({ message: `Produk dengan ID ${item.variant_id} tidak ditemukan` });
            }

            variant.stock += item.quantity;
            await variant.save();
        }

        await OrderModel.update({ status: "cancelled", payment_status: "cancelled" }, { where: { id: orderId } });

        // Periksa apakah pembaruan berhasil
        const updatedOrder = await OrderModel.findByPk(orderId);

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
    const { status, note, availability, order_status } = req.body;
    const currentUser = req.user;

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
                        model: VariantModel,
                        as: "variant",
                        include: [{
                            model: ProductModel,
                            as: "product",
                            include: [{
                                model: UserModel,
                                as: "seller"
                            }]
                        }]
                    }],
                },
            ],
            transaction
        });

        if (!order) {
            await transaction.rollback();
            return res.status(404).send({ message: "Order not found" });
        }


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
            await CourierModel.update({ availability, order_status }, { where: { courier_id: currentUser.id }, transaction });
        } else {
            // Jika role selain courier, ambil courier_id dari body
            // const { courier_id } = req.body;

            // if (!courier_id) {
            //     await transaction.rollback();
            //     return res.status(400).send({ message: "courier_id is required for non-courier users" });
            // }

            await CourierModel.update({ availability, order_status }, { where: { courier_id: order.courier_id }, transaction });
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
                variant_id: item.variant_id,
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
                    const sellerId = item.variant.product.seller.id;
                    const itemTotal = item.quantity * item.variant.price;

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
        // Kirim update real-time via socket.io
        if (io) {
            // Update status order
            io.emit('orderStatusUpdated', {
                orderId,
                newStatus: status,
                updatedAt: new Date()
            });

            // Update availability courier
            if (availability) {
                const courierId = currentUser.role === "courier" ? currentUser.id : order.courier_id;
                io.emit('courierAvailabilityChanged', {
                    courierId,
                    availability,
                    lastUpdated: new Date()
                });
            }
        }


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