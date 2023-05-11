const auth = require("./auth/index");
const admin = require("./admin/index");
const user = require("./user/index");
const project = require("./projectDetail/index")
const booking = require("./booking/index")
const transaction = require("./transaction/index")
const book = require("./book/index")
const category = require("./category/index")
const blog = require("./blog/index")






const controllers = {
    auth,
    admin,
    user,
    project,
    booking,
    transaction,
    book,
    category,
    blog,
}

module.exports = controllers;