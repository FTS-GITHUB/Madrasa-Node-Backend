const mongoose = require('mongoose');
const validator = require("validator");

const subscriptionSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, "Email is required"],
        validate: [validator.isEmail, "Invalid Email"],
    },
    isSubscription: {
        type: Boolean,
        default: false,
    },

},
    {
        timestamps: true,
    })


const subscriptionModel = mongoose.model('subscription', subscriptionSchema)

module.exports = subscriptionModel;


