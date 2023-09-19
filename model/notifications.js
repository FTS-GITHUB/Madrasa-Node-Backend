const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    source: {
        type: String,
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    to: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    type: {
        type: String,
        enum: {
            values: ["book", "meeting"],
            message: "Types must be book OR meeting",
        },
    },
    read: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true,
    })

const NotificationModel = mongoose.model('NotificationModel', notificationSchema)
module.exports = NotificationModel;