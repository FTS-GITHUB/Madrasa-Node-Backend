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
        type: Array,
    },
    image: {
        type: Object,
    },
    file: {
        type: Object,
    },
    bookStatus: {
        type: String,
        enum: {
            values: ["Paid", "Unpaid"],
            message: "price must be paid or unpaid"
        },
        default: "Unpaid"
    },
    price: {
        type: String,
    },
    publisher: {
        type: String
    },
    status: {
        type: String,
        enum: {
            values: ["approved", "rejected", "pending"],
            message: "Status must be approved, rejected or pending",
        },
        default: "pending",
    },
    auther: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CategoryModel"
    },
    isImgDel: {
        type: Boolean,
        default: false
    },

},
    {
        timestamps: true,
    })


bookSchema.pre("find", function (next) {
    this.populate("auther category")
    next();
})

const bookModel = mongoose.model('bookModel', bookSchema)
module.exports = bookModel;