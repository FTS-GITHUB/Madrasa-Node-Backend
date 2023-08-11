const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
    },
    subject: {
        type: String,
    },
    message: {
        type: String,
    },
},
    {
        timestamps: true,
    })

const contactModel = mongoose.model('contactModel', contactSchema)
module.exports = contactModel;