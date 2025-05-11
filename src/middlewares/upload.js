// // middleware/upload.js
// const multer = require('multer');
// const upload = multer({
//     storage: multer.memoryStorage(),
//     limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype.startsWith('image/')) {
//             cb(null, true);
//         } else {
//             cb(new Error('Only images are allowed'), false);
//         }
//     }
// });

const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'), false);
        }
    }
});

module.exports = upload;