const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "blog Title is Required"]
    },
    detail: {
        type: String,
        required: [true, " blog detail is Required"]
    },
    image: {
        type: Object,
    },
    auther: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    status: {
        type: String,
        enum: {
            values: ["approve", "rejected", "pending"],
            message: "Status must Be approve, rejected or pending",
        },
        default: "pending",
    },

},
    {
        timestamps: true,
    })


blogSchema.pre("find", function (next) {
    this.populate("auther")
    next();
})

const blogModel = mongoose.model('blogs', blogSchema)

module.exports = blogModel;


// BuildIn Methods :