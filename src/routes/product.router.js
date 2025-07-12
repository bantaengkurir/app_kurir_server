const express = require("express");

const router = express.Router();
// const { storage } = require("../storage/storage");
// const multer = require("multer");

const upload = require("../config/multer");

const { validateToken } = require("../middlewares/auth")
const { index, indexFirst, indexSeller, showDesc, show, create, remove, update, updateAvailability } = require("../controllers/product.controller")

// /api/babs
router.get("/", validateToken, index);
router.get("/seller", validateToken, indexSeller);
router.get("/desc", showDesc);
router.get("/first", indexFirst);
router.get("/:id", validateToken, show);
router.post("/", validateToken, upload.single("image_url"), create);
router.delete("/delete", validateToken, remove);
router.put("/update", validateToken, updateAvailability);
router.put("/:productId", validateToken, upload.single("image_url"), update);

module.exports = router;