const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { user: UserModel } = require("../models");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const axios = require('axios');
require('dotenv').config()

const generateVerificationCode = () => crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 karakter kode acak

const sendVerificationEmail = async(email, verificationCode) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false, // Abaikan validasi sertifikat
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Verify Your Email",
        text: `Your verification code is: ${verificationCode}`,
    };

    await transporter.sendMail(mailOptions);
};

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

// const resendEmail = async(req, res, next) => {
//     const { email } = req.body;

//     if (!email) {
//         return res.status(400).send({ message: "Email tidak ditemukan" });
//     }

//     try {
//         // Cari user berdasarkan email
//         const user = await UserModel.findOne({ where: { email } });
//         console.log('user', user)

//         if (!user) {
//             return res.status(404).send({ message: "User not found" });
//         }

//         if (user.role == 'courier') {
//             res.status(403).send({
//                 message: 'Silahkan hubungi Admin untuk melakukan aktivasi akun anada ! '
//             })
//         } else {
//             // Generate kode verifikasi baru
//             const newVerificationCode = generateVerificationCode();

//             // Update kode verifikasi di database
//             user.verification_code = newVerificationCode;
//             await user.save();

//             // Kirim email verifikasi baru
//             await sendVerificationEmail(email, newVerificationCode);

//             console.log("Email verification resent to:", email, "Code:", newVerificationCode);

//         }


//         return res.send({
//             success: true,
//             message: "Verification code has been resent to your email",
//         });
//     } catch (error) {
//         console.error("Error in resendEmail:", error);
//         return res.status(500).send({
//             success: false,
//             message: "Failed to resend verification email"
//         });
//     }
// };
const resendEmail = async(req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send({ message: "Email tidak ditemukan" });
    }

    try {
        // Cari user berdasarkan email
        const user = await UserModel.findOne({ where: { email } });

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // Hanya blokir untuk role courier
        if (user.role === 'courier') {
            return res.status(403).send({
                message: 'Silahkan hubungi Admin untuk melakukan aktivasi akun anda!'
            });
        }

        // Generate kode verifikasi baru
        const newVerificationCode = generateVerificationCode();

        // Update kode verifikasi di database
        user.verificationCode = newVerificationCode;
        await user.save();

        // Kirim email verifikasi baru
        await sendVerificationEmail(email, newVerificationCode);

        // console.log("Email verification resent to:", email, "Code:", newVerificationCode);

        return res.send({
            success: true,
            message: "Verification code has been resent to your email",
        });
    } catch (error) {
        console.error("Error in resendEmail:", error);
        return res.status(500).send({
            success: false,
            message: "Failed to resend verification email"
        });
    }
};




const register = async(req, res, next) => {
    const {
        name,
        email,
        password,
        role,
        latitude,
        longitude,
        profile_image,
        phone_number,
        gender,
        // date_of_birth
    } = req.body;

    if (!req.file) {
        return res.status(400).send({ message: "Gambar tidak ditemukan, pastikan gambar diunggah dengan benar" });
    }


    const image = req.file.path; // Cloudinary URL


    try {
        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Format email tidak valid" });
        }

        // Validasi password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password harus mengandung minimal 8 karakter, 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 simbol"
            });
        }


        // Pengecekan email
        const userExist = await UserModel.findOne({ where: { email } });
        if (userExist) {
            return res.status(401).json({ message: "Email already exist" });
        }

        // Generate kode verifikasi
        const verificationCode = generateVerificationCode();

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        const address = await reverseGeocode(latitude, longitude);

        // Buat user baru dengan status belum terverifikasi
        const user = await UserModel.create({
            name,
            email,
            password: passwordHash,
            role,
            address,
            latitude,
            longitude,
            profile_image: image,
            phone_number,
            gender,
            // date_of_birth,
            verification_code: verificationCode,
            is_verified: false,
        });

        if (!user) {
            return res.status(500).send({
                message: "Failed to register user",
                data: null,
            });
        }

        if (user.role !== 'courier') {
            // Kirim email verifikasi
            await sendVerificationEmail(email, verificationCode);
        }


        return res.send({
            message: "User successfully registered. Please check your email to verify your account.",
            data: null,
        });
    } catch (err) {
        console.log("Error : ", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const verifyEmail = async(req, res, next) => {
    const { email, verification_code } = req.body;
    try {
        const user = await UserModel.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.verification_code !== verification_code) {
            return res.status(400).json({ message: "Invalid verification code" });
        }

        // Update status pengguna menjadi terverifikasi
        user.is_verified = true;
        user.verification_code = null; // Hapus kode verifikasi setelah digunakan
        await user.save();

        return res.send({
            message: "Email successfully verified",
            data: verification_code,
        });
    } catch (err) {
        console.log("Error : ", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


// const verifyEmail = async(req, res, next) => {
//     const { email, verification_code } = req.body;

//     console.log("body verifikasi kode", verification_code)
//     console.log("body", req.body)

//     if (!email || !verification_code) {
//         return res.status(400).json({ message: "Email and verification code are required" });
//     }



//     try {
//         const user = await UserModel.findOne({ where: { email } });
//         console.log("user", user)

//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }
//         console.log("verifikasi", verification_code)

//         if (user.verification_code !== verification_code) {
//             return res.status(400).json({ message: "Invalid verification code" });
//         }

//         console.log("kode verifikasi", verification_code)

//         // Update status pengguna menjadi terverifikasi
//         user.is_verified = true;
//         user.verification_code = null; // Hapus kode verifikasi setelah digunakan
//         await user.save();

//         return res.send({
//             message: "Email successfully verified",
//             data: null,
//         });
//     } catch (err) {
//         console.log("Error : ", err.message);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };

// controllers/auth.controller.js
const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        const currentDevice = req.headers['user-agent'] || 'Unknown Device'; // Deteksi perangkat

        const user = await UserModel.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: "Invalid email/password" });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ message: "Invalid email/password" });
        }

        if (!user.is_verified) {
            return res.status(401).json({ message: "Email is not verified. Please verify your email first." });
        }

        // Jika perangkat baru
        const verificationCode = generateVerificationCode();
        user.verification_code = verificationCode;
        await user.save();

        await sendVerificationEmail(user.email, verificationCode);

        user.verification_code = null; // Hapus kode verifikasi jika ada
        await user.save();

        const data = {
            id: user.id,
            username: user.name,
            email: user.email,
            address: user.address,
            phone_number: user.phone_number,
            profile_image: user.profile_image,
            role: user.role,
            createdAt: user.createdAt,
        };

        // Generate tokens
        const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '7d' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        // Simpan di database
        await UserModel.update({ refresh_token: refreshToken }, { where: { id: user.id } });

        const isMobileApp = req.headers['user-agent'].includes('Expo');

        if (isMobileApp) {
            return res.json({
                success: true,
                data: { token, refreshToken, user: data }
            });
        } else {
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000 // 15 menit
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
            });

            return res.json({
                success: true,
                data: { user: data, token } // Tidak kirim token di body untuk web
            });
        }
    } catch (error) {
        console.log("Error : ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// const loginWeb = async(req, res, next) => {
//     const { email, password } = req.body;
//     const currentDevice = req.headers['user-agent'] || 'Unknown Device'; // Deteksi perangkat

//     try {
//         const user = await UserModel.findOne({ where: { email } });

//         if (!user) {
//             return res.status(401).json({ message: "Invalid email/password" });
//         }

//         const isValid = await bcrypt.compare(password, user.password);

//         if (!isValid) {
//             return res.status(401).json({ message: "Invalid email/password" });
//         }

//         if (!user.is_verified) {
//             return res.status(401).json({ message: "Email is not verified. Please verify your email first." });
//         }

//         // Jika perangkat baru
//         // if (user.last_login_device !== currentDevice) {
//         //     // Generate kode verifikasi
//         const verificationCode = generateVerificationCode();
//         user.verification_code = verificationCode;
//         await user.save();

//         //     // Kirim email verifikasi
//         await sendVerificationEmail(user.email, verificationCode);

//         //     return res.status(403).json({
//         //         message: "New device detected. Please verify the code sent to your email.",
//         //     });
//         // }

//         // Login sukses, update perangkat terakhir
//         // user.last_login_device = currentDevice;
//         user.verification_code = null; // Hapus kode verifikasi jika ada
//         await user.save();

//         // Set status online saat login
//         // user.status = 'online';
//         // await user.save();

//         const data = {
//             id: user.id,
//             username: user.name,
//             email: user.email,
//             address: user.address,
//             phone_number: user.phone_number,
//             profile_image: user.profile_image,
//             role: user.role
//         };
//         const token = jwt.sign(data, process.env.JWT_SECRET, {
//             expiresIn: 24 * 60 * 60 * 1000 // Token berlaku 1 hari
//                 // expiresIn: 60 * 1000 // Token berlaku selama 7 hari
//         });

//         // Simpan token ke dalam cookie
//         res.cookie('jwt', token, {
//             httpOnly: true, // Hanya dapat diakses oleh HTTP, bukan JavaScript
//             secure: false,
//             // process.env.NODE_ENV !== 'development', // Hanya HTTPS jika bukan di development
//             sameSite: 'strict', // Mencegah CSRF
//             maxAge: 24 * 60 * 60 * 1000 // Token berlaku 1 hari
//                 // maxAge: 60 * 1000 // Token berlaku 7 hari
//         });

//         // Simpan data pengguna di cookie
//         res.cookie('user_data', JSON.stringify(data), {
//             httpOnly: false, // Dapat diakses oleh JavaScript
//             secure: false,
//             // process.env.NODE_ENV !== 'development',
//             sameSite: 'strict',
//             maxAge: 24 * 60 * 60 * 1000, // 1 hari
//             // maxAge: 60 * 1000, // 7 hari
//         });

//         // const isProduction = process.env.NODE_MODE === 'production';

//         // res.cookie('jwt', token, {
//         //     httpOnly: true,
//         //     secure: isProduction, // false di development
//         //     sameSite: isProduction ? 'none' : 'lax',
//         //     maxAge: 24 * 60 * 60 * 1000,
//         //     domain: isProduction ? 'bantaeng-dessert.store' : 'localhost'
//         // });

//         // res.cookie('user_data', JSON.stringify(data), {
//         //     httpOnly: false,
//         //     secure: isProduction,
//         //     sameSite: isProduction ? 'none' : 'lax',
//         //     maxAge: 24 * 60 * 60 * 1000,
//         //     domain: isProduction ? 'bantaeng-dessert.store' : 'localhost'
//         // });

//         return res.send({
//             message: "Login successful",
//             data: {
//                 data,
//                 token: token, // Opsional, jika Anda juga ingin mengembalikannya dalam respons
//             },
//         });
//     } catch (err) {
//         console.log("Error : ", err.message);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };



// ! ini belum ada refresh tokennya
// const loginWeb = async(req, res, next) => {
//     const { email, password } = req.body;

//     try {
//         // Cari pengguna berdasarkan email
//         const user = await UserModel.findOne({ where: { email } });

//         if (!user) {
//             return res.status(401).json({ message: "Invalid email/password" });
//         }

//         // Bandingkan password
//         const isValid = await bcrypt.compare(password, user.password);
//         if (!isValid) {
//             return res.status(401).json({ message: "Invalid email/password" });
//         }

//         // Buat payload untuk token
//         const data = {
//             id: user.id,
//             nama: user.nama,
//             email: user.email,
//             alamat: user.alamat,
//             role: user.role,
//         };

//         // Buat token dengan masa berlaku (misalnya, 1 jam)
//         const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "24h" });

//         // Kirim respons ke frontend
//         return res.send({
//             message: "Login successful",
//             data: {
//                 user: data,
//                 token: token,
//             },
//         });
//     } catch (err) {
//         console.error("Login error:", err);
//         next(err);
//     }
// };


// !ini dengan refresh token
const loginWeb = async(req, res) => {
    const { email, password } = req.body;
    const currentDevice = req.headers['user-agent'] || 'Unknown Device'; // Deteksi perangkat
    try {


        const user = await UserModel.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: "Invalid email/password" });
        }

        if (!user.is_verified) {
            return res.status(403).json({ message: "Youre account is unverified, please verify first !!" })
        }

        // Bandingkan password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid email/password" });
        }


        // Jika perangkat baru
        if (user.last_login_device !== currentDevice && user.role == 'courier') {
            // Generate kode verifikasi
            const verificationCode = generateVerificationCode();
            user.verification_code = verificationCode;
            await user.save();

            // Kirim email verifikasi
            await sendVerificationEmail(user.email, verificationCode);

            return res.status(403).json({
                message: "New device detected. Please verify the code sent to your email.",
            });
        }

        // Login sukses, update perangkat terakhir
        user.last_login_device = currentDevice;
        user.verification_code = null; // Hapus kode verifikasi jika ada
        await user.save();

        // Set status online saat login
        user.status = 'online';
        await user.save();


        // Buat payload untuk token
        const data = {
            id: user.id,
            username: user.name,
            email: user.email,
            address: user.address,
            profile_image: user.profile_image,
            role: user.role,
        };


        // Buat access token (5 menit) & refresh token (7 hari)
        const accessToken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "1h" });
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

        // Simpan refresh token ke database
        await UserModel.update({ refresh_token: refreshToken }, { where: { id: user.id } });

        // Kirim ke frontend (localStorage)
        res.json({
            message: "Login success",
            data: {
                user: data,
                token: accessToken, // Simpan di localStorage
                refreshToken, // Simpan di localStorage
            },
        });

    } catch (error) {
        console.error("Login error:", err);
        next(err);
    }


};


// const verifyDevice = async(req, res, next) => {
//     const { email, verification_code } = req.body;

//     try {
//         const user = await UserModel.findOne({ where: { email } });

//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         if (user.verification_code !== verification_code) {
//             return res.status(400).json({ message: "Invalid verification code" });
//         }

//         // Verifikasi perangkat sukses
//         const currentDevice = req.headers['user-agent'] || 'Unknown Device';
//         user.last_login_device = currentDevice;
//         user.verification_code = null; // Hapus kode verifikasi
//         await user.save();

//         return res.send({
//             message: "Device successfully verified. Please log in again.",
//         });
//     } catch (err) {
//         next(err);
//     }
// };

const verifyDevice = async(req, res, next) => {
    const { email, verification_code } = req.body;
    const currentDevice = req.headers['user-agent'] || 'Unknown Device'; // Ambil dari header

    try {
        const user = await UserModel.findOne({ where: { email } });

        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.verification_code !== verification_code) {
            return res.status(400).json({ message: "Invalid verification code" });
        }

        user.last_login_device = currentDevice;
        user.verification_code = null; // Hapus kode verifikasi jika ada
        await user.save();

        // Gunakan update langsung untuk memastikan perubahan tersimpan
        // await UserModel.update({
        //     last_login_device: currentDevice,
        //     verification_code: null
        // }, { where: { email } });

        return res.send({
            message: "Device successfully verified. Please log in again.",
        });
    } catch (err) {
        console.error("Error in verifyDevice:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// const logoutUser = async(req, res) => {
//     try {

//         // Menghapus cookie JWT
//         res.clearCookie("jwt", {
//             httpOnly: true,
//             secure: process.env.NODE_ENV !== 'development', // Pastikan `secure: true` di produksi
//             sameSite: 'strict',
//         });

//         return res.status(200).json({ message: "Successfully logged out." });
//     } catch (err) {
//         console.error(err); // Untuk mempermudah debugging
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };


// const logoutUser = async(req, res) => {
//     try {
//         // Dapatkan refresh token dari cookie
//         const refreshToken = req.cookies.refreshToken;

//         console.log("refreshToken from cookie:", refreshToken);

//         if (!refreshToken) {
//             return res.status(400).json({
//                 success: false,
//                 message: "No refresh token found"
//             });
//         }

//         // Verifikasi refresh token untuk mendapatkan user ID
//         const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
//         const userId = decoded.id;

//         // Update user di database
//         await UserModel.update({
//             refresh_token: null,
//             status: 'offline'
//         }, { where: { id: userId } });

//         // Hapus cookie untuk web
//         res.clearCookie('token', {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict'
//         });

//         res.clearCookie('refreshToken', {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict'
//         });

//         return res.status(200).json({
//             success: true,
//             message: "Successfully logged out"
//         });

//     } catch (error) {
//         console.error("Logout error:", error);

//         // Handle berbagai jenis error
//         if (error.name === "JsonWebTokenError") {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid token",
//                 code: "INVALID_TOKEN"
//             });
//         }

//         if (error.name === "TokenExpiredError") {
//             return res.status(401).json({
//                 success: false,
//                 message: "Token expired",
//                 code: "TOKEN_EXPIRED"
//             });
//         }

//         return res.status(500).json({
//             success: false,
//             message: "Internal server error during logout"
//         });
//     }
// };



const logoutUser = async(req, res) => {
    try {
        // 1. Dapatkan token dari berbagai sumber (lebih fleksibel)
        const authHeader = req.headers.authorization || '';
        const token = authHeader.split(' ')[1] || req.body.token;

        // 2. Dapatkan refreshToken (prioritas dari body)
        const refreshToken = req.body.refreshToken ||
            req.headers['x-refresh-token'] ||
            req.cookies.refreshToken;

        // 3. Validasi minimal
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required",
                code: "REFRESH_TOKEN_REQUIRED"
            });
        }

        // 4. Verifikasi refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const userId = decoded.id;

        // 5. Update database
        await UserModel.update({
            refresh_token: null,
            status: 'offline',
            last_logout: new Date()
        }, { where: { id: userId } });

        // 6. Response sukses
        return res.status(200).json({
            success: true,
            message: "Successfully logged out"
        });

    } catch (error) {
        console.error("Detailed logout error:", {
            error: error.message,
            stack: error.stack,
            request: {
                headers: req.headers,
                body: req.body
            }
        });

        // Handle error khusus JWT
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token: " + error.message,
                code: "INVALID_TOKEN"
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired",
                code: "TOKEN_EXPIRED"
            });
        }

        // Error umum
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const logoutUserWeb = async(req, res) => {
    try {
        // Jika Anda ingin menambahkan logika tambahan, seperti menandai pengguna sebagai "offline" di database:
        // const userId = req.user.id; // Ambil ID pengguna dari token (jika menggunakan middleware auth)
        // await UserModel.update({ status: 'offline' }, { where: { id: userId } });

        // Kirim respons berhasil logout
        return res.status(200).json({ message: "Successfully logged out." });
    } catch (err) {
        console.error("Error during logout:", err); // Untuk mempermudah debugging
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


// const logoutUserWeb = async(req, res) => {
//     try {
//         // Mengambil ID pengguna dari cookie
//         const userId = req.cookies.jwt ? decodeJwt(req.cookies.jwt).id : null;

//         if (!userId) {
//             return res.status(400).json({ message: "User not authenticated" });
//         }

//         // Mengubah status user menjadi 'offline'
//         await UserModel.update({ status: 'offline' }, { where: { id: userId } });

//         // Menghapus cookie JWT
//         res.clearCookie("jwt", {
//             httpOnly: true,
//             secure: process.env.NODE_ENV !== 'development', // Pastikan `secure: true` di produksi
//             sameSite: 'strict',
//         });

//         return res.status(200).json({ message: "Successfully logged out and user is offline." });
//     } catch (err) {
//         console.error(err); // Untuk mempermudah debugging
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };


// ! menggunakan cookie
// const logoutUserWeb = async(req, res) => {
//     try {
//         // 1. Dapatkan userId dari cookie JWT (jika ada)
//         const token = req.cookies.jwt;
//         let userId = null;

//         if (token) {
//             try {
//                 userId = decodeJwt(token).id;
//             } catch (err) {
//                 // Jika JWT invalid/expired, anggap user perlu logout paksa
//                 console.warn("Invalid/expired JWT during logout");
//             }
//         }

//         // 2. Update status user ke 'offline' (jika userId valid)
//         if (userId) {
//             await UserModel.update({ status: 'offline' }, { where: { id: userId } });
//         }

//         // 3. Hapus cookie JWT (tanpa peduli apakah userId ada/tidak)
//         res.clearCookie("jwt", {
//             httpOnly: true,
//             secure: process.env.NODE_ENV !== 'development',
//             sameSite: 'strict',
//             path: '/', // ← Pastikan path sama dengan saat cookie dibuat
//         });

//         // 4. Hapus cookie tambahan jika ada
//         res.clearCookie("otherCookieName");

//         return res.status(200).json({
//             success: true,
//             message: "Logout successful"
//         });
//     } catch (err) {
//         console.error("Logout error:", err);
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error during logout"
//         });
//     }
// };

// controllers/auth.controller.js
const refreshToken = async(req, res) => {
    const { refreshToken } = req.body; // Ambil dari localStorage frontend

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
    }

    try {
        // 1. Verifikasi refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // 2. Cek di database
        const user = await UserModel.findOne({ where: { id: decoded.id } });
        if (user.refresh_token !== refreshToken) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        // 3. HAPUS refresh token lama (revoke)
        await UserModel.update({ refresh_token: null }, { where: { id: user.id } });

        // 4. BUAT access token baru (5 menit)
        const newAccessToken = jwt.sign({ id: user.id, nama: user.nama, email: user.email, role: user.role },
            process.env.JWT_SECRET, { expiresIn: "5m" }
        );

        // 5. BUAT refresh token baru (7 hari)
        const newRefreshToken = jwt.sign({ id: user.id },
            process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" }
        );

        // 6. SIMPAN refresh token baru ke database
        await UserModel.update({ refresh_token: newRefreshToken }, { where: { id: user.id } });

        // 7. KIRIM ke frontend (localStorage)
        res.json({
            token: newAccessToken, // Access token baru
            refreshToken: newRefreshToken, // Refresh token baru (simpan lagi di localStorage)
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(401).json({ message: "Invalid or expired refresh token" });
    }
};


// Fungsi untuk mendecode JWT (mengambil payload)
function decodeJwt(token) {
    const payload = token.split('.')[1];
    const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decodedPayload);
}




module.exports = {
    login,
    loginWeb,
    register,
    verifyEmail,
    verifyDevice,
    checkAuth,
    logoutUser,
    logoutUserWeb,
    resendEmail,
    refreshToken
};