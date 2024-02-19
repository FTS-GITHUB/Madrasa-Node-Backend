const express = require("express");
const router = express();
const contactController = require("./dashboard");



router.get("/", contactController.dashboardStatics);

module.exports = router;