const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Booking Title is Required"]
    },
    detail: {
        type: String,
        required: [true, " Booking detail is Required"]
    },
},
    {
        timestamps: true,
    })

const bookingModel = mongoose.model('bookings', bookingSchema)
module.exports = bookingModel;