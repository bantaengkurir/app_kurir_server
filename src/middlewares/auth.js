// const jwt = require("jsonwebtoken")
//     // import jwt from "jsonwebtoken";
// const User = require("../models/user");

// const validateToken = async(req, res, next) => {
//     try {
//         const authHeader = req.headers["authorization"] || "";

//         if (authHeader.split(" ").length !== 2) {
//             return res.status(401).send({ message: "Invalid token" });
//         }

//         const token = authHeader.split(" ")[1];
//         const userData = jwt.verify(token, process.env.JWT_SECRET);
//         if (!userData) {
//             return res.status(401).send({ message: "Invalid token" });
//         }

//         req.user = userData;

//         next();
//     } catch (error) {
//         if (error.name === "JsonWebTokenError") {
//             return res.status(401).send({ message: "Invalid token" });
//         }

//         next(err);
//     }

//     try {
//         const token = req.cookies.jwt;

//         if (!token) {
//             return res.status(401).json({ message: "Unauthorized - No Token Provided" });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         if (!decoded) {
//             return res.status(401).json({ message: "Unauthorized - Invalid Token" });
//         }

//         const user = await User.findById(decoded.userId).select("-password");

//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         req.user = user;

//         next();
//     } catch (error) {
//         console.log("Error in protectRoute middleware: ", error.message);
//         res.status(500).json({ message: "Internal server error" });
//     }
// }

// module.exports = { validateToken }

const jwt = require("jsonwebtoken");
const user = require("../models/user");

const validateToken = (req, res, next) => {
    try {
        // Ambil token dari cookie bernama 'jwt'
        const token = req.cookies.jwt;

        console.log("Token:", token);

        // Jika token tidak ada, kirim respons 401
        if (!token) {
            return res.status(401).send({ message: "Access denied. No token provided." });
        }

        // Verifikasi token menggunakan JWT_SECRET
        const userData = jwt.verify(token, process.env.JWT_SECRET);
        if (!userData) {
            return res.status(401).send({ message: "Invalid token" });
        }

        // Simpan data user yang terverifikasi ke req.user
        req.user = userData;

        // Lanjutkan ke middleware berikutnya
        next();
    } catch (error) {
        // Tangani error JWT
        if (error.name === "JsonWebTokenError") {
            return res.status(401).send({ message: "Error Invalid token" });
        }

        // Tangani error lainnya
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports = { validateToken };