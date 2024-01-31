const express = require("express");
const router = express();
const contactController = require("./contact");

// Middleware : 
const auth = require('../../middlewares/auth/auth')





router.post("/add", contactController.addContact);

router.use(auth.authenticate);

router.get("/", contactController.allContact);

module.exports = router;