const auth = require("./auth/index");
const admin = require("./admin/index");
const user = require("./user/index");
const project = require("./projectDetail/index")





const controllers = {
    auth,
    admin,
    user,
    project
}

module.exports = controllers;