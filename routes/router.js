const express = require("express");
const routes = require("../constants/routes");
const controllers = require("../controller");
const router = express();

router.use(routes.AUTH, controllers.auth);
router.use(routes.ADMIN, controllers.admin);
router.use(routes.USER, controllers.user);
router.use(routes.PROJECT, controllers.project);
router.use(routes.BOOKING, controllers.booking);
router.use(routes.TRANSACTION, controllers.transaction);
router.use(routes.BOOK, controllers.book);
router.use(routes.CATEGORY, controllers.category);

module.exports = router;