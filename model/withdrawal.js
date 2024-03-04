const mongoose = require('mongoose');
const validator = require("validator");

const withdrawalSchema = new mongoose.Schema({
    UserData: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "User Data is Requierd"]
    },
    country: {
        type: String,
        default: false,
    },
    currency: {
        type: String,
        required: [true, "Currency is required"]
    },
    bank_name: {
        type: String,
        default: false,
    },
    branch_name: {
        type: String,
        default: false,
    },
    branch_code: {
        type: String,
        default: false,
    },
    iban: {
        type: Number,
        default: false,
    },
    account_number: {
        type: Number,
        default: false,
    },
    amount: {
        type: Number,
        default: false,
    },
},
    {
        timestamps: true,
    })


const withdrawalnModel = mongoose.model('withdrawal', withdrawalSchema)

module.exports = withdrawalnModel;


