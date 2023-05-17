const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const bookController = require("./book");
const multer = require("../../utils/multer")



router.use(auth.authenticate)


router.post("/",multer.single("file"), bookController.addBook);
router.get("/", bookController.getAllBook);
router.get("/public", bookController.getPublicBook);
router.get("/:id",bookController.getBookById);
router.patch("/review",bookController.reviewBook);
router.patch("/:id",multer.single("file"), bookController.updateBookById);
router.delete("/:id", bookController.deleteBookById);

module.exports = router;