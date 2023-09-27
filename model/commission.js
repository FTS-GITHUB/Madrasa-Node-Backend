const mongoose = require('mongoose');


const commisionSchema = new mongoose.Schema({
    bookCommission : {
        type : Number,
    },
    meetingCommission : {
        type : Number,
    }

},{
    timestamps : true,
})

const commissionModel = mongoose.model('CommissionModel', commisionSchema)

module.exports = commissionModel;