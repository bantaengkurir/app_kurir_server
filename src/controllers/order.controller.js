const { courier: CourierModel, user: UserModel, order: OrderModel, product: ProductModel, orderitem: OrderItemModel, shipping_cost: ShippingModel, payment: PaymentModel } = require("../models");

const axios = require('axios');
const order = require("../models/order");
const geolib = require('geolib');

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */

const index = async(req, res, next) => {
    try {
        const orders = await OrderModel.findAll({
            where: {
                user_id: req.user.id,
            },
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

        const formattedOrders = orders.map((order) => {
            // Menghitung total quantity dari orderitem
            const totalQuantity = order.orderitem.reduce((acc, item) => acc + item.quantity, 0);

            return {
                user_id: order.user_id,
                order_id: order.id,
                total: parseFloat(order.total_price),
                quantity: totalQuantity,
                payment_method: order.payment_method,
                address: order.shipping_cost ? order.shipping_cost.address : null,
                latitude: order.shipping_cost ? order.shipping_cost.latitude : null,
                longitude: order.shipping_cost ? order.shipping_cost.longitude : null,
                distance: order.shipping_cost ? order.shipping_cost.distance : null,
                created_at: order.created_at,
                // courier: order.couriers,
                courier: {
                    id: order.couriers.id,
                    name: order.couriers.name,
                    email: order.couriers.email,
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
                    seller_name: item.product.seller ? item.product.seller.name : null, // Perbaikan di sini
                    seller_phone_number: item.product.seller ? item.product.seller.phone_number : null, // Perbaikan di sini
                    seller_address: item.product.seller ? item.product.seller.address : null,
                    seller_profile_image: item.product.seller ? item.product.seller.profile_image : null,
                })),
                shipping_cost: order.shipping_cost,
                // payment: order.payment,
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

    if (idOrder.length === 0) {
        return res.status(400).send({ message: "Data tidak ditemukan" });
    }

    // if (!latitude || !longitude) {
    //     return res.status(400).send({ message: "Latitude dan Longitude wajib diisi" });
    // }

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
            as: 'seller', // Pastikan alias ini sesuai dengan definisi di model
            attributes: ['id', 'latitude', 'longitude'] // Ambil latitude dan longitude seller
        }]
    });

    if (products.length !== idOrder.length) {
        return res.status(400).send({ message: "Satu atau lebih produk tidak ditemukan" });
    }

    // Mengambil lokasi seller dari produk pertama (asumsi semua seller memiliki lokasi yang sama)
    const sellerLocation = products[0].seller;
    if (!sellerLocation || !sellerLocation.latitude || !sellerLocation.longitude) {
        return res.status(400).send({ message: "Lokasi seller tidak ditemukan" });
    }

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

    // Tambahkan logika untuk memilih courier_id
    const couriers = await UserModel.findAll({
        where: {
            role: "courier",
            status: "online",
        },
        attributes: ['id', 'latitude', 'longitude'] // Ambil hanya id, latitude, dan longitude
    });

    if (couriers.length === 0) {
        return res.status(400).send({ message: "Tidak ada courier yang tersedia" });
    }

    // Hitung jarak ke masing-masing courier dan temukan yang terdekat
    let closestCourier = null;
    let minDistance = Infinity;

    const getRoadDistance = async(origin, destination) => {
        const apiKey = process.env.API_KEY_GEOCODING_MAPS;
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${apiKey}`;

        try {
            const response = await axios.get(url);
            if (response.data.rows[0].elements[0].status === "OK") {
                const distanceInMeters = response.data.rows[0].elements[0].distance.value;
                return distanceInMeters; // Jarak dalam meter
            }
            throw new Error("Jarak tidak ditemukan");
        } catch (error) {
            console.error("Error calculating road distance:", error.response ? error.response.data : error.message);
            throw new Error("Terjadi kesalahan saat menghitung jarak");
        }
    };


    for (const courier of couriers) {
        const courierDistance = geolib.getDistance({ latitude, longitude }, // Lokasi user
            { latitude: courier.latitude, longitude: courier.longitude } // Lokasi courier
        );

        if (courierDistance < minDistance) {
            minDistance = courierDistance;
            closestCourier = courier;
        }
    }

    // Jika courier ditemukan, gunakan id-nya sebagai courier_id
    if (!closestCourier) {
        return res.status(400).send({ message: "Tidak ada courier yang tersedia dalam jangkauan" });
    }

    const courier_id = closestCourier.id;

    const newOrder = await OrderModel.create({
        user_id: currentUser.id,
        courier_id,
        order_date: new Date(),
        payment_method,
        order_code: code,
    });

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
        where: {
            id: newOrder.id,
        },
    });

    // Hitung jarak antara seller dan user
    const userLocation = { latitude, longitude };

    const distance = await getRoadDistance(userLocation, {
        latitude: sellerLocation.latitude,
        longitude: sellerLocation.longitude,
    });


    const address = await reverseGeocode(latitude, longitude);

    let shipping = 0;

    if (distance < 1000) {
        shipping = 5000
    } else {
        shipping = 5000 + distance * 1500 / 1000
    }


    // Lanjutkan membuat data pengiriman
    const newShipping = await ShippingModel.create({
        order_id: newOrder.id,
        address,
        latitude,
        longitude,
        distance, // Menyimpan jarak dalam meter
        shipping_cost: shipping,
    });


    return res.send({
        message: "Success",
        data: {
            order_id: newOrder.id,
            courier_id: newOrder.courier_id,
            total_price: totalPrice,
            courier: order.courier,
            items: orderItems.map((od) => ({
                product_id: od.product_id,
                quantity: od.quantity,
                price: parseFloat(od.price),
                subtotal: parseFloat(od.subtotal),
            })),
            shipping_cost: newShipping,
            // payment: newPayment,
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
            payment_status: order.payment_status,
            payment_method: order.payment_method,
            address: order.shipping_cost ? order.shipping_cost.address : null,
            latitude: order.shipping_cost ? order.shipping_cost.latitude : null,
            longitude: order.shipping_cost ? order.shipping_cost.longitude : null,
            distance: order.shipping_cost ? order.shipping_cost.distance : null,
            created_at: order.created_at,
            // courier: order.couriers,
            courier: {
                id: order.couriers.id,
                name: order.couriers.name,
                email: order.couriers.email,
                phone_number: order.couriers.phone_number,
                latitude: order.couriers.latitude,
                longitude: order.couriers.longitude,
                vehicle_type: order.couriers.courier ? order.couriers.courier.length > 0 ? order.couriers.courier[0].vehicle_type : null : null,
                vehicle_plate: order.couriers.courier ? order.couriers.courier.length > 0 ? order.couriers.courier[0].vehicle_plate : null : null,
            },
            items: order.orderitem
                .map((item) => ({
                    product_id: item.product.id,
                    name: item.product.name,
                    description: item.product.description,
                    image_url: item.product.image_url,
                    price: parseFloat(item.product.price),
                    stock: item.product.stock,
                    quantity: item.quantity,
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

        console.log("Status awal order:", order.status);

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

        await OrderModel.update({ status: "cancelled" }, { where: { id: orderId } });

        // Periksa apakah pembaruan berhasil
        const updatedOrder = await OrderModel.findByPk(orderId);
        console.log("Status order setelah pembaruan:", updatedOrder.status);

        return res.send({ message: "Order cancelled successfully" });
    } catch (error) {
        next(error);
    }
};




/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const updateStatus = async(req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;

    try {
        const order = await OrderModel.findByPk(orderId);

        if (!order) {
            return res.status(404).send({ message: "Order not found" });
        }

        if (order.status == "cancelled") {
            res.status(403).send({ message: "Order has been cancelled" });
        }

        await OrderModel.update({ status }, { where: { id: orderId } });

        return res.send({ message: "Order status updated successfully" });
    } catch (error) {
        next(error);
    }
};


module.exports = { index, create, getOrderById, cancelOrder, updateStatus };