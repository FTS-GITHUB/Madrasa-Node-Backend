const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const ScheduleController = require("./schedule");



router.get("/public", ScheduleController.getPublicSchedule);
router.use(auth.authenticate)


router.post("/", ScheduleController.addSchedule);

module.exports = router;