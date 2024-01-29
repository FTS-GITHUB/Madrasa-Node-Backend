const express = require("express");
const router = express();
const auth = require("../../middlewares/auth/auth")
const transactionController = require("./transaction");




router.post('/getCustomer', transactionController.customerGet)
router.get('/getAllCustomer', transactionController.getAllCustomers)
router.put('/updateCustomer', transactionController.customerUpdate)
router.post('/addBalance', transactionController.addBalance)

router.use(auth.authenticate)

router.get("/", transactionController.getAllTransaction);

router.post("/", transactionController.addTransaction);
router.post("/pay", transactionController.addPaymentMethod);
router.post('/free', transactionController.addFreeTransaction)

router.get("/:id", transactionController.getTransactionById);
router.patch("/review", transactionController.reviewTransaction);
router.patch("/:id", transactionController.updateTransactionById);
router.delete("/:id", transactionController.deleteTransactionById);

module.exports = router;