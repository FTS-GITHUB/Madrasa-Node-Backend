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
        type: String,
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
    image: {
        type: Object,
    },
    status: {
        type: String,
        enum: {
            values: ["rejected", "paid", "pending"],
            message: "Status must Be pending, paid or rejected",
        },
        default: "pending",
    },
},
    {
        timestamps: true,
    })


const withdrawalnModel = mongoose.model('withdrawal', withdrawalSchema)

module.exports = withdrawalnModel;


