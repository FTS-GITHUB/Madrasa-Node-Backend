const express = require("express");
const router = express();
// const auth = require("../../middlewares/auth/auth");
// const roles = require("../../constants/roles")
const withdrawalController = require("./withdrawal");
// const multer = require("../../utils/multer");
// Middleware : 
const auth = require('../../middlewares/auth/auth');
const multer = require("../../utils/multer");

router.use(auth.authenticate)
router.post("/", withdrawalController.addRequest);
router.get("/", withdrawalController.getAllWithdrawals);
router.get("/totalwithdrawal", withdrawalController.totalwithdrawl);
router.post("/updateWithdrawal/:id", multer.single("file"), withdrawalController.updateWithdrawal);


module.exports = router;