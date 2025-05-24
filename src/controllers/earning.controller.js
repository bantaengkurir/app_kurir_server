const { Op, Sequelize } = require("sequelize");
const { courier_earning: Courier_earningModel, seller_earning: Seller_earningModel, order: OrderModel } = require("../models")

// const indexCourier = async(req, res, next) => {
//     const { date } = req.query; // Ambil parameter tanggal dari query

//     console.log("Received date parameter:", date); // Debugging

//     try {

//         let whereCondition = {};

//         // Jika user bukan admin, filter berdasarkan user_id
//         if (req.user.role !== "admin") {
//             whereCondition.user_id = req.user.id;
//         }


//         const earnings = await Courier_earningModel.findAll({
//             where: whereCondition, // Gunakan kondisi where yang sudah ditentukan

//             where: {
//                 courier_id: req.user.id,
//                 earning_date: Sequelize.where(
//                     Sequelize.fn('DATE', Sequelize.col('earning_date')), // Ambil hanya bagian tanggal
//                     date // Bandingkan dengan tanggal yang dikirim dari frontend
//                 ),
//             },
//         });

//         // console.log("Filtered earnings:", earnings); // Debugging

//         res.send({
//             message: "Success",
//             data: earnings,
//         });
//     } catch (error) {
//         console.error("Error fetching earnings:", error);
//         res.status(500).send({
//             message: "Internal Server Error",
//         });
//     }
// };


const indexCourier = async(req, res, next) => {
    const { date } = req.query; // Ambil parameter tanggal dari query

    console.log("Received date parameter:", date); // Debugging

    try {
        let whereCondition = {};

        // Jika user bukan admin, filter berdasarkan courier_id dan tanggal
        if (req.user.role !== "admin") {
            whereCondition = {
                courier_id: req.user.id, // Filter berdasarkan courier_id user yang login
                earning_date: Sequelize.where(
                    Sequelize.fn('DATE', Sequelize.col('earning_date')), // Ambil hanya bagian tanggal
                    date // Bandingkan dengan tanggal yang dikirim dari frontend
                ),
            };
        } else {
            // Jika admin, filter hanya berdasarkan tanggal (tanpa courier_id)
            whereCondition = {
                earning_date: Sequelize.where(
                    Sequelize.fn('DATE', Sequelize.col('earning_date')), // Ambil hanya bagian tanggal
                    date // Bandingkan dengan tanggal yang dikirim dari frontend
                ),
            };
        }

        // Ambil data earnings berdasarkan kondisi where
        const earnings = await Courier_earningModel.findAll({
            where: whereCondition,
        });

        // console.log("Filtered earnings:", earnings); // Debugging

        res.send({
            message: "Success",
            data: earnings,
        });
    } catch (error) {
        console.error("Error fetching earnings:", error);
        res.status(500).send({
            message: "Internal Server Error",
        });
    }
};

// const courierearningId = async(req, res, next) => {
//     const { courier_id } = req.body;
//     console.log("Received courier_id:", courier_id); // Debugging
//     try {
//         const earning = await Courier_earningModel.findAll({
//             where: {
//                 courier_id,
//             },
//         });
//         if (!earning) {
//             return res.status(404).send({
//                 message: "Earning not found",
//                 data: null
//             });
//         }
//         return res.send({
//             message: "Success",
//             data: earning
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).send({
//             message: "Internal Server Error"
//         });
//     }
// };

const courierearningId = async(req, res) => {
    const courier_id = req.query.courier_id;

    if (!courier_id) {
        return res.status(400).send({
            message: "courier_id is required",
            data: []
        });
    }

    try {
        const earnings = await Courier_earningModel.findAll({
            where: { courier_id },
            order: [
                    ['createdAt', 'DESC']
                ] // Urutkan dari yang terbaru
        });

        return res.send({
            message: "Success",
            data: earnings || [] // Pastikan selalu mengembalikan array
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({
            message: "Internal Server Error",
            data: []
        });
    }
};
const sellerEarningById = async(req, res) => {
    const { id } = req.params;

    console.log("Received seller_id:", id); // Debugging

    if (!id) {
        return res.status(400).send({
            message: "seller_id is required",
            data: []
        });
    }

    try {
        const earnings = await Seller_earningModel.findAll({
            where: { seller_id: id },
        });

        return res.send({
            message: "Success",
            data: earnings || [] // Pastikan selalu mengembalikan array
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({
            message: "Internal Server Error",
            data: []
        });
    }
};


const indexSeller = async(req, res, next) => {
    const { date } = req.query; // Ambil parameter tanggal dari query

    console.log("Received date parameter:", date); // Debugging

    try {
        let whereCondition = {};

        // Jika user bukan admin, filter berdasarkan courier_id dan tanggal
        if (req.user.role !== "admin") {
            whereCondition = {
                seller_id: req.user.id, // Filter berdasarkan courier_id user yang login
                earning_date: Sequelize.where(
                    Sequelize.fn('DATE', Sequelize.col('earning_date')), // Ambil hanya bagian tanggal
                    date // Bandingkan dengan tanggal yang dikirim dari frontend
                ),
            };
        } else {
            // Jika admin, filter hanya berdasarkan tanggal (tanpa courier_id)
            whereCondition = {
                earning_date: Sequelize.where(
                    Sequelize.fn('DATE', Sequelize.col('earning_date')), // Ambil hanya bagian tanggal
                    date // Bandingkan dengan tanggal yang dikirim dari frontend
                ),
            };
        }

        // Ambil data earnings berdasarkan kondisi where
        const earnings = await Seller_earningModel.findAll({
            where: whereCondition,
        });

        // console.log("Filtered earnings:", earnings); // Debugging

        res.send({
            message: "Success",
            data: earnings,
        });
    } catch (error) {
        console.error("Error fetching earnings:", error);
        res.status(500).send({
            message: "Internal Server Error",
        });
    }
};




module.exports = { indexCourier, indexSeller, courierearningId, sellerEarningById };


// const { Op } = require("sequelize");
// const { courier_earning: Courier_earningModel } = require("../models");

// const index = async(req, res, next) => {
//     const currentUser = req.user.id;

//     try {
//         // Get query parameters
//         const {
//             page = 1,
//                 limit = 10,
//                 start_date,
//                 end_date
//         } = req.query;

//         // Parse pagination parameters
//         const pageNum = parseInt(page) || 1;
//         const limitNum = parseInt(limit) || 10;
//         const offset = (pageNum - 1) * limitNum;

//         // Build where clause
//         const whereClause = {
//             courier_id: currentUser
//         };

//         // Add date filter if provided
//         if (start_date || end_date) {
//             whereClause.createdAt = {};

//             if (start_date) {
//                 const startDate = new Date(start_date);
//                 startDate.setUTCHours(0, 0, 0, 0);
//                 whereClause.createdAt[Op.gte] = startDate;
//             }

//             if (end_date) {
//                 const endDate = new Date(end_date);
//                 endDate.setUTCHours(23, 59, 59, 999);
//                 whereClause.createdAt[Op.lte] = endDate;
//             }
//         }

//         // Query database
//         const { count, rows } = await Courier_earningModel.findAndCountAll({
//             where: whereClause,
//             limit: limitNum,
//             offset: offset,
//             order: [
//                 ['createdAt', 'DESC']
//             ]
//         });

//         // Calculate pagination info
//         const totalPages = Math.ceil(count / limitNum);

//         return res.send({
//             message: "success",
//             data: rows,
//             pagination: {
//                 current_page: pageNum,
//                 total_items: count,
//                 total_pages: totalPages,
//                 per_page: limitNum
//             }
//         });

//     } catch (error) {
//         console.error("Error: ", error);
//         return res.status(500).send({
//             message: "Internal server error",
//             error: error.message
//         });
//     }
// };

// module.exports = { index };