const express = require("express");

const router = express.Router();
// const { storage } = require("../storage/storage");
// const multer = require("multer");

// const upload = require("../config/multer");

const { validateToken } = require("../middlewares/auth")
const {
    // index, indexSeller, showDesc, 
    show,
    indexSallery,
    createCourier,
    showCourier,
    updateCourier
    //  create, remove, update 
} = require("../controllers/user.controller")

// /api/babs
// router.get("/", index);
// router.get("/seller", validateToken, indexSeller);
router.get("/couriersallery", validateToken, indexSallery);
router.get("/my-courier", validateToken, showCourier);
router.get("/:id", validateToken, show);
router.post("/create-courier", validateToken, createCourier);
router.put("/update-courier", validateToken, updateCourier);
// router.delete("/:productId", validateToken, remove);
// router.put("/:productId", validateToken, upload.single("image_url"), update);


module.exports = router;