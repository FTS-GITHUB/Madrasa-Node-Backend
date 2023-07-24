const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const ScheduleController = require("./schedule");



router.get("/public", ScheduleController.getPublicSchedule);
router.use(auth.authenticate)


router.post("/add", ScheduleController.addSchedule);
router.get("/teacher", ScheduleController.TeacherSchedule);

module.exports = router;