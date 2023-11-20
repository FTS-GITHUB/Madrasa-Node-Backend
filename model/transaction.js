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
    sellerId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            default: null
        }
    ],
    title: String,
    orderPrice: {
        type: Number,
    },
    sources: [
        {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "sourceModel",
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
            values: ["book", "tution", 'meeting'],
            message: "Order Type must be book , tution or meeting"
        },
        default: "book",
    },
    sourceModel: {
        type: String,
        required: true,
        enum: ['bookModel', 'MeetingModel']
    },
    balance: {
        type: Number,
    },
    charges: {
        type: Number,
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
    this.populate("buyerId sellerId sources")
    next();
})

const transactionModel = mongoose.model('transactionModel', transactionSchema)
module.exports = transactionModel;