const express = require('express')

// Controllers : 
const commisionController = require('./commission');

// Middleware : 
const auth = require('../../middlewares/auth/auth')

// Router : 
const router = express();


router.post("/add", commisionController.setCommission)
router.get("/get", commisionController.getCommission);
router.put("/update/:id", commisionController.updateCommission)
router.delete("/delete/:id", commisionController.deleteCommission)




module.exports = router;