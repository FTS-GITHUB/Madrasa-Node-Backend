const mongoose = require('mongoose');

const eventsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Blog Title is Required"]
    },
    description: {
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
    date: {
        type: String
    },
    country: {
        type: String
    },
    city: {
        type: String
    },
    type: {
        type: String,
        enum: {
            values: ["marquee", "event"],
            message: "Type must be marquee OR event"
        }
    }


},
    {
        timestamps: true,
    })

// BuildIn Methods :
eventsSchema.pre("find", function (next) {
    this.populate("auther")
    next();
})

const eventModel = mongoose.model('eventModel', eventsSchema)

module.exports = eventModel;


