const express = require("express");
const routes = require("../constants/routes");
const controllers = require("../controller");
const router = express();

router.use(routes.AUTH, controllers.auth);
router.use(routes.ADMIN, controllers.admin);
router.use(routes.USER, controllers.user);
router.use(routes.PROJECT, controllers.project);

module.exports = router;