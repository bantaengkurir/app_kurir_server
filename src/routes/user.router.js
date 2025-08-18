const express = require("express");

const router = express.Router();
// const { storage } = require("../storage/storage");
// const multer = require("multer");

const upload = require("../config/multer");

const { validateToken } = require("../middlewares/auth")
const {
    indexUser,
    indexCourier,
    indexSeller,
    // showDesc, 
    show,
    indexSallery,
    createCourier,
    showCourier,
    updateCourier,
    updateUser,
    showUsers,
    resetPassword,
    resetPasswordLink,
    serviceFcm
    //  create, remove, update 
} = require("../controllers/user.controller")

// /api/babs
router.get("/users", validateToken, indexUser);
router.get("/couriers", validateToken, indexCourier);
router.get("/:id/users", validateToken, showUsers);
router.get("/seller", validateToken, indexSeller);
router.get("/couriersallery", validateToken, indexSallery);
router.get("/my-courier", validateToken, showCourier);
router.get("/:id", validateToken, show);
router.post("/create-courier", validateToken, createCourier);
router.post("/save-fcm-token", validateToken, serviceFcm);
router.put("/update-courier", validateToken, updateCourier);
router.put("/:userId/update-user", validateToken, upload.single("profile_image"), updateUser);
router.post("/forgot-password", resetPasswordLink);
router.post("/reset-password", resetPassword);
// router.delete("/:productId", validateToken, remove);
// router.put("/:productId", validateToken, upload.single("image_url"), update);


module.exports = router;