const mongoose = require("mongoose");

// Helpers :
const RandomStrGen = require("../utils/uniqueStringGenrator")



const MeetingSchema = new mongoose.Schema({
    title: String,
    link: String,
    shortLink: String,
    adminLink: String,
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
}, { timestamps: true })

MeetingSchema.methods.createShortLink = async function () {
    console.log("IN MIDDLEWARE");
    let shortLink = ""
    do {
        shortLink = RandomStrGen(8);
    } while (
        await MeetingModel.findOne({
            shortLink: shortLink
        })
    );
    this.shortLink = `${shortLink}`
    // this.shortLink = `/api/meeting/public/${shortLink}`
    console.log("IN MIDDLEWARE -----> ", this.shortLink);
    return this.shortLink
};


const MeetingModel = mongoose.model("MeetingModel", MeetingSchema)
module.exports = MeetingModel;

