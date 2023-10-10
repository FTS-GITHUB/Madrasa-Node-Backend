const express = require("express");
const routes = require("../constants/routes");
const controllers = require("../controller");
const router = express();

router.use(routes.AUTH, controllers.auth);
router.use(routes.ADMIN, controllers.admin);
router.use(routes.USER, controllers.user);
router.use(routes.ROLE, controllers.role);
router.use(routes.PROJECT, controllers.project);
router.use(routes.BOOKING, controllers.booking);
router.use(routes.TRANSACTION, controllers.transaction);
router.use(routes.BOOK, controllers.book);
router.use(routes.CATEGORY, controllers.category);
router.use(routes.TAG, controllers.tag);
router.use(routes.BLOG, controllers.blog);
router.use(routes.MEETING, controllers.meeting);
router.use(routes.SEARCH, controllers.search)
router.use(routes.SUBSCRIPTION, controllers.subscription)
router.use(routes.SCHEDULE, controllers.schedule)
router.use(routes.EVENTS, controllers.event)
router.use(routes.CONTACT, controllers.contact)
router.use(routes.NOTIFICATION, controllers.notification)
router.use(routes.COMMISSION, controllers.commission)


module.exports = router;