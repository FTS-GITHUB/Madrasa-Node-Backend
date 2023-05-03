const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Project Title is Required"]
    },
    description: {
        type: String,
        required: [true, " Project Description is Required"]
    },
    status: {
        type: String,
        enum: {
            values: ["cancelled", "inprogress", "completed", "active", "pending"],
            message: "Status must be inprogress, active, completed or pending",
        },
        default: "inprogress",
        // default : false
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    engineer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null,
    },
    contractor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null
    },
},
    {
        timestamps: true,
    })

const projectModel = mongoose.model('projects', projectSchema)
module.exports = projectModel;