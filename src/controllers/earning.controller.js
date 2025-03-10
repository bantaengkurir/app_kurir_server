const { Op, Sequelize } = require("sequelize");
const { courier_earning: Courier_earningModel, seller_earning: Seller_earningModel, order: OrderModel } = require("../models")

const index = async(req, res, next) => {
    const { date } = req.query; // Ambil parameter tanggal dari query

    console.log("Received date parameter:", date); // Debugging

    try {
        const earnings = await Courier_earningModel.findAll({
            where: {
                earning_date: Sequelize.where(
                    Sequelize.fn('DATE', Sequelize.col('earning_date')), // Ambil hanya bagian tanggal
                    date // Bandingkan dengan tanggal yang dikirim dari frontend
                ),
            },
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




module.exports = { index };


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