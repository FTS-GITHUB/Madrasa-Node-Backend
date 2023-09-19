const mongoose = require("mongoose");




const OnlineUserSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    socketId:{
        type:"String"
    }
})

const OnlineUsersModel = mongoose.model("OnlineUserModel", OnlineUserSchema)
module.exports = OnlineUsersModel;