const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const categoryController = require("./category");




router.use(auth.authenticate)

router.get("/", categoryController.categoryGet);
router.post("/", categoryController.categoryPost);
router.patch("/:id", categoryController.categoryPatch);
router.delete("/:id", categoryController.categoryDelete);

router.route("/:id")
    .get()

module.exports = router;