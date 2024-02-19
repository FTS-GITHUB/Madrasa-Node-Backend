const stripe = require("stripe")

let SECKEY;
if (process.env.NODE_ENV == "live") {
    SECKEY = process.env.STRIPE_PRIVATE_KEY_LIVE
} else {
    SECKEY = process.env.STRIPE_PRIVATE_KEY_TEST
}

const createStripeAccount = async (name, email) => {
    return await stripe(SECKEY).customers.create({
        name: name,
        email: email,
        description: "This Account is Under Madrasa.io"

    })
}

const TransaferAmountToCustomer = async ({ customerId, amount }) => {
    return await stripe(SECKEY).customers.createBalanceTransaction(
        customerId,
        {
            amount: amount,
            currency: "usd"
        }
    )
}

module.exports = { STRIPE: stripe(SECKEY), createStripeAccount, TransaferAmountToCustomer }
