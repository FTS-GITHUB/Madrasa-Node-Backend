const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Blog Title is Required"]
    },
    detail: {
        type: String,
        required: [true, " Blog Detail is Required"]
    },
    image: {
        type: Object,
    },
    auther: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    quote: {
        type: String,
    },
    isImgDel: {
        type: Boolean,
        default: false
    },
    slug: {
        type: String,
        unique: true,
        required: [true, "Slug is Required"]
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CategoryModel"
    }],
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "tags"
    }],
    review: [{
        UserData: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        text: String,
        value: Number
    }],
    comments: [{
        UserData: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        text: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: {
            values: ["approved", "rejected", "pending"],
            message: "Status must Be approve, rejected or pending",
        },
        default: "pending",
    },

},
    {
        timestamps: true,
    })

// BuildIn Methods :
blogSchema.pre("find", function (next) {
    this.populate("auther tags categories comments.UserData")
    next();
})

const blogModel = mongoose.model('blogs', blogSchema)

module.exports = blogModel;


