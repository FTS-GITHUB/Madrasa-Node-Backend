const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const bookingController = require("./booking");




router.use(auth.authenticate)

router.post("/", bookingController.addBooking);
router.get("/", bookingController.getAllBooking);
router.get("/:id",bookingController.getBookingById);
router.patch("/:id", bookingController.updateBookingById);
router.delete("/:id", bookingController.deleteBookingById);

module.exports = router;