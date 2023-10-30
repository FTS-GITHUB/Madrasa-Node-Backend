const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        // unique: true,
    },
    profileImage: {
        type: Object,
    },
    firstName: {
        type: String,
        // required: [true, "First name is required"],
    },
    lastName: {
        type: String,
        // required: [true, "Last name is required"],
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, "Email is required"],
        validate: [validator.isEmail, "Invalid Email"],
    },
    gender: {
        type: String,
        enum: {
            values: ["male", "female"],
            message: "Gender must be male OR female",
        },
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RoleModel"
    },
    phone: {
        type: String,
    },
    timezone : {
        type : String,
    },
    age : {
        type : String,
    },
    address: {
        type: String,
    },
    bio: {
        type: String,
    },
    dob: {
        type: String,
    },
    nationality: {
        type: String,
    },
    residence: {
        type: String,
    },
    languages: {
        type: Array,
    },
    primaryLanguage: {
        type: String,
    },
    participation: {
        type: String,
    },
    education: {
        type: Array,
    },
    work: {
        type: Array,
    },
    rate: Number,
    currency: { type: String },
    serviceType: { type: String },
    password: {
        type: String,
        minlength: [8, "Password minimum length must be 8 characters"],
        // required: [true, "Password is required"],
        select: false,
    },
    status: {
        type: String,
        enum: {
            values: ["pending", "created", "approved", "banned"],
            message: "Status must be pending , created , approved , OR banned",
        },
        default: "pending"
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
    stripId : {
        type : String,
    },
    isSuperAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
})

// Virtuals :
userSchema.virtual("fullName")
    .get(() => {
        return `${this.firstName} ${this.lastName}`
    })

userSchema.pre("find", function (next) {
    this.populate("role")
    next();
})
userSchema.pre("findOne", function (next) {
    this.populate("role")
    next();
})
userSchema.pre("find", function (next) {
    this.populate("role")
    next();
})


// Methods :
userSchema.methods.createEmailVerifyToken = async function () {
    let token;
    token = Math.floor(100000 + Math.random() * 900000).toString();
    // do {
    //     token = Math.floor(100000 + Math.random() * 900000).toString();
    // } while (
    //     await userModel.findOne({
    //         emailVerificationCode: crypto
    //             .createHash("sha256")
    //             .update(token)
    //             .digest("hex"),
    //     })
    // );
    // this.emailVerificationCode = crypto
    //     .createHash("sha256")
    //     .update(token)
    //     .digest("hex");
    this.emailVerificationCode = token;
    this.emailVerificationTokenExpires = Date.now() + 10 * 60 * 1000;
    return token;
};
userSchema.methods.verifyEmail = async function ({ email, token }) {
    let matchEmailCode = await userModel.findOne({ email, emailVerificationCode: token })

    if (matchEmailCode) {
        this.isEmailVerified = true;
        return true;
    }
    return false;
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