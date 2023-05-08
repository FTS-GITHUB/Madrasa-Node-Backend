const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category Title is Required"]
    },
},
    {
        timestamps: true,
    })

const categoryModel = mongoose.model('categorys', categorySchema)
module.exports = categoryModel;