const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const tagController = require("./tag");
const roles = require("../../constants/roles");




router.use(auth.authenticate)

router.post("/", tagController.addTag);
router.get("/", tagController.getAllTag);
router.get("/:id",tagController.getTagById);
router.delete("/:id",auth.restrictTo([roles.ADMIN, roles.SUPERADMIN]), tagController.deleteTagById);

module.exports = router;