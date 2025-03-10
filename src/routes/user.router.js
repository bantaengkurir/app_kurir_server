const express = require("express");

const router = express.Router();
// const { storage } = require("../storage/storage");
// const multer = require("multer");

// const upload = require("../config/multer");

const { validateToken } = require("../middlewares/auth")
const {
    // index, indexSeller, showDesc, 
    show,
    indexSallery
    //  create, remove, update 
} = require("../controllers/user.controller")

// /api/babs
// router.get("/", index);
// router.get("/seller", validateToken, indexSeller);
// router.get("/desc", showDesc);
router.get("/couriersallery", validateToken, indexSallery);
router.get("/:id", validateToken, show);
// router.post("/", validateToken, upload.single("image_url"), create);
// router.delete("/:productId", validateToken, remove);
// router.put("/:productId", validateToken, upload.single("image_url"), update);


module.exports = router;