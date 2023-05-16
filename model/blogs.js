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
    isImgDel: {
        type : Boolean,
        default : false
    },
    slug : {
        type : String,
        unique : true,
        required : [true, "Slug is Required"]
    },
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
    this.populate("auther")
    next();
})

const blogModel = mongoose.model('blogs', blogSchema)

module.exports = blogModel;


