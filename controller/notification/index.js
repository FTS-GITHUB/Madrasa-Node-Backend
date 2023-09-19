const express = require("express");

// Controller :
const contactController = require("./notification");

// Middleware :
const auth = require("../../middlewares/auth/auth")

// Router :
const router = express();





// Middleware Init :
router.use(auth.authenticate);

router.get("/", contactController.getAllNotifications);


module.exports = router;