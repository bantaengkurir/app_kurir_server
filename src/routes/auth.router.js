const express = require("express");

const router = express.Router();

const upload = require("../config/multer");


const { login, loginWeb, register, verifyEmail, verifyDevice, checkAuth, logoutUser, logoutUserWeb, resendEmail } = require("../controllers/auth.controller");
const { validateLogin, validateRegister } = require("../middlewares/validator.js");

// /api/babs
router.post("/login", validateLogin, login);
router.post("/loginweb", validateLogin, loginWeb);
router.post("/register", upload.single("profile_image"), register);
router.post("/verify-email", verifyEmail);
router.post('/verify-device', verifyDevice);
router.get("/check", checkAuth);
router.post("/logout", logoutUser);
router.post("/logoutWeb", logoutUserWeb);
router.post("/resend-email", resendEmail);

module.exports = router;