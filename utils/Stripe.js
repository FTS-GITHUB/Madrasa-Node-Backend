const stripe = require("stripe")

let SECKEY;
if (process.env.NODE_ENV == "live") {
    SECKEY = process.env.STRIPE_PRIVATE_KEY_LIVE
} else {
    SECKEY = process.env.STRIPE_PRIVATE_KEY_TEST
}

module.exports = stripe(SECKEY)