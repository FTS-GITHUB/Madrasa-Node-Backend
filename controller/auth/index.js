const express = require("express");
const router = express();
const authController = require("./auth");

router.post("/login", authController.login);

router.post("/register/validate", authController.validate);
router.post("/register/genrateEmailCode", authController.genrateEmailVerificationCode);
router.post("/register/verifyEmail", authController.verifyEmailCode);
router.post("/register/changeEmail", authController.changeEmail);
router.post("/register/savePassword", authController.addPassword)

router.post("/forget/genrateEmailCode", authController.genrateForgetEmailVerificationCode);
router.post("/forget/resetPassword", authController.resetPassword);

router.post("/google/login", authController.googleLogin);

// router.post("/signup", authController.signup);
// router.post("/verify", authController.verify);
// router.post("/verify-email-code", authController.verifyEmailVerificationCode);

module.exports = router;