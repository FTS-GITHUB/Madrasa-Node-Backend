const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const projectController = require("./project");




router.use(auth.authenticate)

router.get("/", projectController.projectGet);
router.post("/", projectController.projectPost);

router.route("/:id")
    .get()

module.exports = router;