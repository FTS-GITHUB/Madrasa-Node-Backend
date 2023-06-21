const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const bookController = require("./book");
const multer = require("../../utils/multer")



router.get("/public", bookController.getPublicBook);
router.use(auth.authenticate)


router.post("/", multer.fields([{ name: "cover", maxCount: 1 }, { name: "file", maxCount: 1 }]), bookController.addBook);
router.get("/", bookController.getAllBook);
router.get("/:id", bookController.getBookById);
router.patch("/reviewBook", bookController.reviewBook);
router.patch("/:id", multer.single("file"), bookController.updateBookById);
router.delete("/:id", bookController.deleteBookById);

module.exports = router;