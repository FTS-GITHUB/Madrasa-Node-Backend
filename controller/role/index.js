const express = require("express");
const router = express();

const RoleController = require("./role");

const auth = require("../../middlewares/auth/auth")
const roles = require("../../constants/roles");




router.use(auth.authenticate);

router.get("/", RoleController.getAllRoles);
router.post("/", RoleController.createRole);

module.exports = router;