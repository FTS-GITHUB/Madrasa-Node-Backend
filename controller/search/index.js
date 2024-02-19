const express = require("express")
const router = express();
const auth = require('../../middlewares/auth/auth')
const searchController = require('./search')


// router.use(auth.authenticate)

router.post("/get",searchController.getSearchResult)


module.exports = router;