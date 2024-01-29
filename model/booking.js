const mongoose = require("mongoose");





const BookingSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        require: true
    },
    details: [{
        _id: false,
        transactionData: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "transactionModel",
            require: true
        },
        sources: [{
            _id: false,
            bookData: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "bookModel",
                require: true
            },
            review: {
                _id: false,
                value: Number,
                text: String
            }
        }],

    }]
}, { timestamps: true });

BookingSchema.pre("find", function (next) {
    this.populate("buyer").populate({ path: "details", populate: "transactionData sources.bookData" })
    next();
})

const BookingModel = mongoose.model("BookingModel", BookingSchema)
module.exports = BookingModel;

