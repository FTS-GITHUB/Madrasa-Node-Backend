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
    title: String,
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null
    },
    sellers: [
        {
            userData: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
                default: null
            },
            sources: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: "sourceModel",
                }
            ],
            orderPrice: Number,
            charges: Number,
            balance: Number
        }
    ],
    sources: [
        {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "sourceModel",
        }
    ],
    sourceModel: {
        type: String,
        required: true,
        enum: ['bookModel', 'MeetingModel']
    },
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
    orderPrice: {
        type: Number,
    },
    balance: {
        type: Number,
    },
    buyerCharges: {
        type: Number,
    },
    sellerCharges: {
        type: Number
    },
    comissionPercent: {
        type: Number
    },
    adminBalance: {
        type: Number
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
    this.populate("buyer sources").populate({ path: "sellers", populate: "userData sources" })
    next();
})

const transactionModel = mongoose.model('transactionModel', transactionSchema)
module.exports = transactionModel;