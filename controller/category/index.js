const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const categoryController = require("./category");




router.use(auth.authenticate)

router.post("/", categoryController.addCategory);
router.get("/", categoryController.getAllCategory);
router.get("/:id",categoryController.getCategoryById);
router.delete("/:id", categoryController.deleteCategoryById);

module.exports = router;