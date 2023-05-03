const express = require("express");
const router = express();
const authController = require("./auth");

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/verify", authController.verify);
router.post("/send-email-code", authController.sendEmailVerificationCode);
router.post("/verify-email-code", authController.verifyEmailVerificationCode);

module.exports = router;