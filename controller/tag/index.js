const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const tagController = require("./tag");




router.use(auth.authenticate)

router.post("/", tagController.addTag);
router.get("/", tagController.getAllTag);
router.get("/:id",tagController.getTagById);
router.delete("/:id", tagController.deleteTagById);

module.exports = router;