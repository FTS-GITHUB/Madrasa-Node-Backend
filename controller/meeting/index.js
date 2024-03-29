const express = require("express");
const router = express();

// Controller :
const MeetingController = require("./meeting");

// Helpers :
const auth = require("../../middlewares/auth/auth");
const roles = require("../../constants/roles");
const multer = require("../../utils/multer");


router.get("/public/:shortLink", MeetingController.getMeetingLinkWithShortLink)

// MiddleWare :
router.use(auth.authenticate);

// Routes :
router.route("/")
    .get(MeetingController.getAllMeetings)
    .post(MeetingController.createMeetinglink)
// .post(auth.restrictTo([roles.ADMIN, roles.SUPERADMIN, roles.TEACHER]), MeetingController.createMeetinglink)

router.post("/paid", MeetingController.createPaidMeetinglink)
router.get("/paid", MeetingController.getAllPaidMeetings)
router.patch("/paid/:id", MeetingController.startPaidMeeting)

router.get("/:id", MeetingController.getMeetingByID)

module.exports = router;