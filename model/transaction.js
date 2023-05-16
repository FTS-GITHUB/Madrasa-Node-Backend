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
    price: {
        type: String,
    },
    source: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bookModel",
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