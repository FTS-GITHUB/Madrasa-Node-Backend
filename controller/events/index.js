const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth");
const roles = require("../../constants/roles")
const eventController = require("./events");


router.get("/public", eventController.getPublicEvents);
router.use(auth.authenticate)

router.post("/", eventController.addEvent);
router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);
router.patch("/:id", eventController.updateEventById);
router.delete("/:id", eventController.deleteEventById);

module.exports = router;