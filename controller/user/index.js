const express = require("express");
const router = express();
const user = require("./user");
const auth = require("../../middlewares/auth/auth");
const roles = require("../../constants/roles");
const multer = require("../../utils/multer");




router.use(auth.authenticate);

router.route("/")
    .get(user.getProfile)
    .patch(multer.single("file"), user.updateAccount)

// ADMIN Routes :
router.get("/all", auth.restrictTo([roles.ADMIN, roles.SUPERADMIN]), user.getAllUser);
// router.get("/user/:id", user.getById);
router.patch("/approve/:id", auth.restrictTo([roles.SUPERADMIN]), user.approve);
router.patch("/ban/:id", auth.restrictTo([roles.SUPERADMIN]), user.ban);

module.exports = router;