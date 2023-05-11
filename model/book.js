const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Book Title is Required"]
    },
    detail: {
        type: String,
        required: [true, " book detail is Required"]
    },
    review: {
        type: String,
    },
    image: {
        type: String,
    },
    price: {
        type: String,
        enum: {
            values: ["Paid", "Unpaid"],
            message: "price must be paid or unpaid"
        },
        default: "Unpaid"
    },
    status: {
        type: String,
        enum: {
            values: ["approve", "rejected", "pending"],
            message: "Status must be approve, rejected or pending",
        },
        default: "pending",
    },
    auther: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category"
    },

},
    {
        timestamps: true,
    })

const bookModel = mongoose.model('books', bookSchema)
module.exports = bookModel;