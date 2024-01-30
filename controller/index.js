const auth = require("./auth/index");
const admin = require("./admin/index");
const role = require("./role/index");
const user = require("./user/index");
const project = require("./projectDetail/index")
const booking = require("./booking/index")
const transaction = require("./transaction/index")
const book = require("./book/index")
const category = require("./category/index")
const tag = require("./tag/index")
const blog = require("./blog/index")
const meeting = require("./meeting/index")
const search = require("./search/index")
const subscription = require("./subscription/index")
const schedule = require("./schedule/index")
const event = require("./events/index")
const contact = require("./contact/index")
const notification = require("./notification/index")
const commission = require('./commission/index')
const dashboard = require('./dashboard/index')





const controllers = {
    auth,
    admin,
    user,
    role,
    project,
    booking,
    transaction,
    book,
    category,
    tag,
    blog,
    meeting,
    search,
    subscription,
    schedule,
    event,
    contact,
    notification,
    commission,
    dashboard
}

module.exports = controllers;