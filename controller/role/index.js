const express = require("express");
const router = express();

const RoleController = require("./role");

const auth = require("../../middlewares/auth/auth")
const roles = require("../../constants/roles");




router.get("/", RoleController.getAllRoles);
router.use(auth.authenticate);

router.post("/", RoleController.createRole);
router.patch("/:id", RoleController.updateRole);
router.delete("/:id", RoleController.deleteRole);

module.exports = router;