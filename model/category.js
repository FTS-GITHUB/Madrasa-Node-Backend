const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique : true,
        required: [true, "Category Title is Required"]
    },
},
    {
        timestamps: true,
    })

const categoryModel = mongoose.model('CategoryModel', categorySchema)
module.exports = categoryModel;