const mongoose = require("mongoose");

// Helpers :
const RandomStrGen = require("../utils/uniqueStringGenrator")



const BookingSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null
    },
    firstName: String,
    lastName: String,
    email: String,
    title: String,
    // thoughts: String,
    startDate : String,
    link: String,
    shortLink: String,
    adminLink: String,
    type: {
        type: String,
        enum: {
            values: ["instantMeeting", "course"]
        }
    },
    status: {
        type: String,
        enum: {
            values: ["pending", "completed", "failed"]
        },
        default:"pending"
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
}, { timestamps: true })

BookingSchema.methods.createShortLink = async function () {
    console.log("IN MIDDLEWARE");
    let shortLink = ""
    do {
        shortLink = RandomStrGen(8);
    } while (
        await BookingModel.findOne({
            shortLink: shortLink
        })
    );
    this.shortLink = `${shortLink}`
    // this.shortLink = `/api/meeting/public/${shortLink}`
    console.log("IN MIDDLEWARE -----> ", this.shortLink);
    return this.shortLink
};
BookingSchema.pre("find", function (next) {
    this.populate("admin")
    next();
})

const BookingModel = mongoose.model("BookingModel", BookingSchema)
module.exports = BookingModel;

