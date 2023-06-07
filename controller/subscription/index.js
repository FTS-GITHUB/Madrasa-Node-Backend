const express = require("express")
const router = express();
const auth = require('../../middlewares/auth/auth')
const subscriptionController = require('./subscription')


// router.use(auth.authenticate)

router.post("/",subscriptionController.emailSubscription)


module.exports = router;