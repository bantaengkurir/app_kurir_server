const express = require("express");

const router = express.Router();

const { validateToken } = require("../middlewares/auth")
const {
    // index, indexSeller, showDesc, 
    index
    // indexSallery
    //  create, remove, update 
} = require("../controllers/earning.controller")

// /api/babs
// router.get("/", index);
// router.get("/seller", validateToken, indexSeller);
// router.get("/desc", showDesc);
router.get("/", validateToken, index);
// router.get("/:id", validateToken, show);
// router.delete("/:productId", validateToken, remove);
// router.put("/:productId", validateToken, upload.single("image_url"), update);


module.exports = router;