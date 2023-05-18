const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const transactionController = require("./transaction");




router.use(auth.authenticate)

router.post("/", transactionController.addTransaction);
router.get("/", transactionController.getAllTransaction);
router.get("/:id", transactionController.getTransactionById);
router.patch("/review", transactionController.reviewTransaction);
router.patch("/:id", transactionController.updateTransactionById);
router.delete("/:id", transactionController.deleteTransactionById);

module.exports = router;