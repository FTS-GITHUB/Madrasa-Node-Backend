const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const transactionController = require("./transaction");




router.use(auth.authenticate)

router.get("/", transactionController.transactionGet);
router.post("/", transactionController.transactionPost);
router.patch("/:id", transactionController.transactionPatch);
router.delete("/:id", transactionController.transactionDelete);

router.route("/:id")
    .get()

module.exports = router;