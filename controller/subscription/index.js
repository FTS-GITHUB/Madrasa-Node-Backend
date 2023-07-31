const express = require("express")
const router = express();
const auth = require('../../middlewares/auth/auth')
const subscriptionController = require('./subscription')


// router.use(auth.authenticate)

router.post("/",subscriptionController.emailSubscription)
router.post("/sendEmail",subscriptionController.sendEmailToSubscribedUser)
router.get("/all",subscriptionController.getAllSubscribedUser)
router.delete("/:id",subscriptionController.deleteSubscribedUser)


module.exports = router;