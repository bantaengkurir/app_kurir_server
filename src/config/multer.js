const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// Konfigurasi penyimpanan Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "products", // Nama folder di Cloudinary
        allowed_formats: ["jpeg", "png", "jpg"], // Format file yang diperbolehkan
    },
});

// Konfigurasi multer dengan batasan ukuran file
const upload = multer({
    storage,
    limits: {
        fileSize: 500 * 1024, // Ukuran maksimum file dalam byte (500 KB)
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("File harus berupa gambar!"), false);
        }
        cb(null, true);
    },
});

module.exports = upload;