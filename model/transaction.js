const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    orderPrice: {
        type: String,
    },
    source: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "bookModel",
        }
    ],
    status: {
        type: String,
        enum: {
            values: ["approved", "rejected", "pending"],
            message: "Status must Be approve, rejected or pending",
        },
        default: "pending",
    },
    transactionType :{
        type : String,
        enum: {
            values : ["initial" , "full"],
            message : "Transaction Type must be Initial or Full"
        },
        default : "full",
    },
    balance : {
        type : String,
    },
    charges : {
        type : String,
    },
    orderType : {
        type : String,
    }
},
    {
        timestamps: true,
    })

transactionSchema.pre("find", function (next) {
    this.populate("sender receiver source")
    next();
})

const transactionModel = mongoose.model('transactionModel', transactionSchema)
module.exports = transactionModel;