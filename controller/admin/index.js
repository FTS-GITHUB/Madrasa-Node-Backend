const express = require("express");
const router = express();
const admin = require("./admin")
const auth = require("../../middlewares/auth/auth");
const roles = require("../../constants/roles");

router.use(auth.authenticate);
router.post("/admin", auth.restrictTo([roles.SUPERADMIN]), admin.addAdmin)
router.patch("/admin/:id", auth.restrictTo([roles.SUPERADMIN]), admin.editAdmin)
router.post("/customer", auth.restrictTo([roles.ADMIN, roles.SUPERADMIN]), admin.addCustomer)
router.delete("/admin/multiple", auth.restrictTo([roles.SUPERADMIN]), admin.deleteMultipleAdmins)
router.delete("/admin/:id", auth.restrictTo([roles.SUPERADMIN]), admin.deleteAdmin)


module.exports = router;