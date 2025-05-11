// // const jwt = require("jsonwebtoken")
// //     // import jwt from "jsonwebtoken";
// // const User = require("../models/user");

// // const validateToken = async(req, res, next) => {
// //     try {
// //         const authHeader = req.headers["authorization"] || "";

// //         if (authHeader.split(" ").length !== 2) {
// //             return res.status(401).send({ message: "Invalid token" });
// //         }

// //         const token = authHeader.split(" ")[1];
// //         const userData = jwt.verify(token, process.env.JWT_SECRET);
// //         if (!userData) {
// //             return res.status(401).send({ message: "Invalid token" });
// //         }

// //         req.user = userData;

// //         next();
// //     } catch (error) {
// //         if (error.name === "JsonWebTokenError") {
// //             return res.status(401).send({ message: "Invalid token" });
// //         }

// //         next(err);
// //     }

// //     try {
// //         const token = req.cookies.jwt;

// //         if (!token) {
// //             return res.status(401).json({ message: "Unauthorized - No Token Provided" });
// //         }

// //         const decoded = jwt.verify(token, process.env.JWT_SECRET);

// //         if (!decoded) {
// //             return res.status(401).json({ message: "Unauthorized - Invalid Token" });
// //         }

// //         const user = await User.findById(decoded.userId).select("-password");

// //         if (!user) {
// //             return res.status(404).json({ message: "User not found" });
// //         }

// //         req.user = user;

// //         next();
// //     } catch (error) {
// //         console.log("Error in protectRoute middleware: ", error.message);
// //         res.status(500).json({ message: "Internal server error" });
// //     }
// // }

// // module.exports = { validateToken }

const jwt = require("jsonwebtoken");
const user = require("../models/user");

// const validateToken = (req, res, next) => {
//     try {
//         // Ambil token dari cookie bernama 'jwt'
//         const token = req.cookies.jwt;

//         console.log("Token:", token);

//         // Jika token tidak ada, kirim respons 401
//         if (!token) {
//             return res.status(401).send({ message: "Access denied. No token provided." });
//         }

//         // Verifikasi token menggunakan JWT_SECRET
//         const userData = jwt.verify(token, process.env.JWT_SECRET);
//         if (!userData) {
//             return res.status(401).send({ message: "Invalid token" });
//         }

//         // Simpan data user yang terverifikasi ke req.user
//         req.user = userData;

//         // Lanjutkan ke middleware berikutnya
//         next();
//     } catch (error) {
//         // Tangani error JWT
//         if (error.name === "JsonWebTokenError") {
//             return res.status(401).send({ message: "Error Invalid token" });
//         }

//         // Tangani error lainnya
//         return res.status(500).send({ message: "Internal Server Error" });
//     }
// };

// module.exports = { validateToken };

// const validateToken = (req, res, next) => {
//     try {
//         // Cek token dari header atau cookie
//         const token = req.headers.authorization.split(' ')[1] || req.cookies.jwt;

//         console.log("Token:", token);

//         if (!token) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Authorization token required"
//             });
//         }

//         const userData = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = userData;
//         next();
//     } catch (error) {
//         // Handle token expired khusus untuk mobile
//         if (error.name === "TokenExpiredError") {
//             return res.status(401).json({
//                 success: false,
//                 message: "Token expired",
//                 code: "TOKEN_EXPIRED"
//             });
//         }

//         res.status(401).json({
//             success: false,
//             message: "Invalid token"
//         });
//     }
// };

const validateToken = (req, res, next) => {
    try {
        // Cek token dari berbagai sumber
        let token;

        // 1. Cek dari Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // 2. Cek dari cookies
        else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }
        // 3. Cek dari query string (untuk testing)
        else if (req.query.token) {
            token = req.query.token;
        }

        console.log("Token sources:", {
            authHeader: req.headers.authorization,
            cookies: req.cookies,
            query: req.query
        });

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authorization token required",
                details: "Token not found in headers, cookies, or query"
            });
        }

        const userData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = userData;
        next();
    } catch (error) {
        // ... (error handling tetap sama)
        console.error("Token validation error:", error.message);
    }
};

module.exports = { validateToken };

// const validateToken = (req, res, next) => {
//     try {
//         // Ambil token dari header atau cookie
//         const authHeader = req.headers.authorization;
//         const token = authHeader && authHeader.split(' ')[1] || req.cookies.jwt;

//         if (!token) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Authorization token required"
//             });
//         }

//         // Verifikasi token
//         const userData = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = userData; // Simpan data user di request
//         next();
//     } catch (error) {
//         if (error.name === "TokenExpiredError") {
//             return res.status(401).json({
//                 success: false,
//                 message: "Token expired",
//                 code: "TOKEN_EXPIRED"
//             });
//         }

//         res.status(401).json({
//             success: false,
//             message: "Invalid token"
//         });
//     }
// };

// module.exports = { validateToken };