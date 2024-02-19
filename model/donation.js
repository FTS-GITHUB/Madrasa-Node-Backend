const mongoose = require("mongoose");




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
const DonationSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null
    },
    balance: Number,
    shippingDetails: shippingSchema,

}, { timestamps: true });

// DonationSchema.pre("find", function (next) {
//     this.populate("buyer").populate({ path: "details", populate: "transactionData sources.bookData" })
//     next();
// })

const DonationModel = mongoose.model("DonationModel", DonationSchema)
module.exports = DonationModel;

