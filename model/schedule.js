const mongoose = require('mongoose')


const Availibility = new mongoose.Schema({
    title : {type : String},
    start : {type : String},
    end : {type : String},
    bookingId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "BookingModel",
        default : null,
    },
}, {_id : false})


const Schedule = new mongoose.Schema({
    teacher : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    Availibility : Availibility,
})


const ScheduleModel = mongoose.model("ScheduleModel", Schedule)
module.exports = ScheduleModel