const mongoose = require('mongoose');


const shippingSchema = new mongoose.Schema({
    email: String,
    firstName: String,
    lastName: String,
    country: String,
    city: String,
    postalCode: String,
    contactNumber: String,
    address: String,
}, { _id: false })
const transactionSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null
    },
    title: String,
    orderPrice: {
        type: String,
    },
    sources: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "bookModel",
        }
    ],
    status: {
        type: String,
        enum: {
            values: ["received", "paid", "pending"],
            message: "Status must Be pending, paid or received",
        },
        default: "pending",
    },
    transactionType: {
        type: String,
        enum: {
            values: ["initial", "full"],
            message: "Transaction Type must be Initial or Full"
        },
        default: "full",
    },
    orderType: {
        type: String,
        enum: {
            values: ["book", "tution"],
            message: "Order Type must be book or tution"
        },
        default: "book",
    },
    balance: {
        type: String,
    },
    charges: {
        type: String,
    },
    invoice: {
        type: String,
        default: null
    },
    shippingDetails: shippingSchema
},
    {
        timestamps: true,
    })

transactionSchema.pre("find", function (next) {
    this.populate("buyerId sources")
    next();
})

const transactionModel = mongoose.model('transactionModel', transactionSchema)
module.exports = transactionModel;