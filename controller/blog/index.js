const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth");
const roles = require("../../constants/roles")
const blogController = require("./blog");
const multer = require("../../utils/multer");


router.get("/public", blogController.getPublicBlog);
router.use(auth.authenticate)

router.post("/",multer.single("file"), blogController.addBlog);
router.get("/", blogController.getAllBlog);
router.get("/:id", blogController.getBlogById);
router.patch("/reviewBlog",auth.restrictTo([roles.ADMIN, roles.SUPERADMIN]),blogController.reviewBlog);
router.patch("/:id",multer.single("file"),blogController.updateBlogById);
router.delete("/:id",blogController.deleteBlogById);

module.exports = router;