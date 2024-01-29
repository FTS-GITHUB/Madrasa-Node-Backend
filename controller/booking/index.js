const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const bookingController = require("./booking");




router.use(auth.authenticate)

router.get("/", bookingController.getAllBooking);

router.post("/", bookingController.addBooking);
router.post("/pay", bookingController.addBooking);

router.get("/purchased", bookingController.getAllPaidBookings);
router.put("/purchased/review", bookingController.reviewBooking);

module.exports = router;