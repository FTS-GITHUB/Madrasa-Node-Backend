const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const bookController = require("./book");




router.use(auth.authenticate)


router.post("/", bookController.addBook);
router.get("/", bookController.getAllBook);
router.get("/:id",bookController.getBookById);
router.patch("/:id", bookController.updateBookById);
router.delete("/:id", bookController.deleteBookById);

module.exports = router;