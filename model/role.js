const mongoose = require('mongoose');




const RouteSchema = new mongoose.Schema({
    label: {
        type: String
    },
    key: {
        type: String,
        required: [true, "Route Name is Requried"]
    },
    permissions: {
        type: [String],
        enum: {
            values: ["view", "create", "edit", "delete"],
            message: "Permissions must be view, create, edit or delete",
        },
    }
})
const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "Role Name is Required"]
    },
    routes: [RouteSchema],
    notDeleteAble: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true,
    })

const RoleModel = mongoose.model('RoleModel', RoleSchema)
module.exports = RoleModel;