const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    profileImage: {
        type: Object,
    },
    firstName: {
        type: String,
        required: [true, "First name is required"],
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, "Email is required"],
        validate: [validator.isEmail, "Invalid Email"],
    },
    phone: {
        type: String,
    },
    address: {
        type: String,
    },
    password: {
        type: String,
        minlength: [8, "Password minimum length must be 8 characters"],
        required: [true, "Password is required"],
        select: false,
    },
    banned: {
        type: Boolean,
        default: false,
    },
    emailVerificationCode: {
        type: String,
        select: false,
    },
    phoneVerificationCode: {
        type: String,
        select: false,
    },
    emailVerificationTokenExpires: {
        type: Date,
        select: false,
    },
    phoneVerificationTokenExpires: {
        type: Date,
        select: false,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },
    token: {
        type: String,
    },
    role: {
        type: String,
        enum: {
            values: [
                "superadmin",
                "admin",
                "client",
                "contractor",
                "engineer"
            ],
            message:
                "Role Must be superadmin, admin or client , contractor , engineer",
        },
        required: [true, "Role is required"],
    },
    archived: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

// userSchema.virtual("certificate", {
//     ref: "certificate",
//     localField: "_id",
//     foreignField: "certificator",
// });

userSchema.methods.createEmailVerifyToken = async function () {
    let token;
    do {
        token = Math.floor(100000 + Math.random() * 900000).toString();
    } while (
        await userModel.findOne({
            emailVerificationCode: crypto
                .createHash("sha256")
                .update(token)
                .digest("hex"),
        })
    );
    this.emailVerificationCode = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    this.emailVerificationTokenExpires = Date.now() + 10 * 60 * 1000;
    return token;
};

userSchema.methods.createPhoneVerifyToken = async function () {
    let token;
    do {
        token = Math.floor(100000 + Math.random() * 900000).toString();
    } while (
        await User.findOne({
            phoneVerificationCode: crypto
                .createHash("sha256")
                .update(token)
                .digest("hex"),
        })
    );
    this.phoneVerificationCode = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    this.phoneVerificationTokenExpires = Date.now() + 10 * 60 * 1000;
    return token;
};

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;