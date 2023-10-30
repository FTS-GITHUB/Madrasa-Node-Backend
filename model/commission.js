const mongoose = require('mongoose');


const commisionSchema = new mongoose.Schema({
    serviceName : {
        type : String,
    },
    serviceCommission : {
        type : Number,
    }

},{
    timestamps : true,
})

const commissionModel = mongoose.model('CommissionModel', commisionSchema)

module.exports = commissionModel;