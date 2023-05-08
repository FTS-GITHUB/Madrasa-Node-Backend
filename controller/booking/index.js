const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const bookingController = require("./booking");




router.use(auth.authenticate)

router.get("/", bookingController.bookingGet);
router.post("/", bookingController.bookingPost);
router.patch("/:id", bookingController.bookingPatch);
router.delete("/:id", bookingController.bookingDelete);

router.route("/:id")
    .get()

module.exports = router;