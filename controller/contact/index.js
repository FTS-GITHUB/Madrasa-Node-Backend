const express = require("express");
const router = express();
const contactController = require("./contact");



router.post("/add", contactController.addContact);

module.exports = router;