const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const categoryController = require("./category");
const roles = require("../../constants/roles");



router.get("/", categoryController.getAllCategory);

router.use(auth.authenticate)

router.post("/", categoryController.addCategory);
router.get("/:id", categoryController.getCategoryById);
// router.delete("/:id",auth.restrictTo([roles.ADMIN, roles.SUPERADMIN]), categoryController.deleteCategoryById);
router.delete("/:id", categoryController.deleteCategoryById);

module.exports = router;