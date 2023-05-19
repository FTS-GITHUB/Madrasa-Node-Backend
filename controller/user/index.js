const express = require("express");
const router = express();

// Controller :
const UserController = require("./user");

// Helpers :
const auth = require("../../middlewares/auth/auth");
const roles = require("../../constants/roles");
const multer = require("../../utils/multer");




// MiddleWare :
router.use(auth.authenticate);

// Routes :
router.route("/")
    .get(UserController.getProfile)
    .patch(multer.single("file"), UserController.updateAccount)
    // ADMIN Route :
    .post(auth.restrictTo([roles.ADMIN, roles.SUPERADMIN]), multer.single("file"), UserController.addNewUserByAdmn)

// ADMIN Routes :
router.get("/all", auth.restrictTo([roles.ADMIN, roles.SUPERADMIN]), UserController.getAllUser);
router.patch("/review", auth.restrictTo([roles.SUPERADMIN, roles.ADMIN]), UserController.reviewUser);
router.get("/:id", auth.restrictTo([roles.ADMIN, roles.SUPERADMIN]), UserController.getUserById);
router.delete("/:userId", auth.restrictTo([roles.ADMIN, roles.SUPERADMIN]), UserController.deleteUser);

module.exports = router;