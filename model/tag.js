const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        unique : true,
        required: [true, "tag Title is Required"]
    },
},
    {
        timestamps: true,
    })

const tagModel = mongoose.model('tags', tagSchema)
module.exports = tagModel;