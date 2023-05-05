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
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "book",
    }
},
    {
        timestamps: true,
    })

const transactionModel = mongoose.model('transactions', transactionSchema)
module.exports = transactionModel;