const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const bookController = require("./book");




router.use(auth.authenticate)

router.get("/", bookController.bookGet);
router.post("/", bookController.bookPost);
router.patch("/:id", bookController.bookPatch);
router.delete("/:id", bookController.bookDelete);

router.route("/:id")
    .get()

module.exports = router;