const mongoose = require('mongoose');




const RouteSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "Route Name is Requried"]
    },
    permissions: {
        type: [String],
        enum: {
            values: ["get", "create", "edit", "delete"],
            message: "Permissions must be get, create, edit or delete",
        },
    }
})
const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "Role Name is Required"]
    },
    routes: [RouteSchema]
},
    {
        timestamps: true,
    })

const RoleModel = mongoose.model('RoleModel', RoleSchema)
module.exports = RoleModel;