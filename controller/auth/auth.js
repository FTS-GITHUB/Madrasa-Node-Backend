const express = require("express");

// Models :
const userModel = require("../../model/user");

// Helpers :
const jwt = require("../../utils/jwt");
const bycrypt = require("../../utils/bycrypt");
const SendEmail = require("../../utils/emails/sendEmail");
const crypto = require("crypto");
const catchAsync = require("../../utils/catchAsync");
const { STATUS_CODE, ERRORS, SUCCESS_MSG } = require("../../constants/index")






const login = catchAsync(async (req, res) => {
    try {
        console.log("hit")
        let email = req.body.email,
            password = req.body.password;
        if (!email || !password) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: `${!email ? "Email" : "Password"} is required.`, statusCode: STATUS_CODE.BAD_REQUEST });
            return;
        }

        const doc = await userModel.findOne({ email }).select("+password");
        if (doc) {
            const isCorrect = await bycrypt.comparePassword(password, doc.password);
            if (isCorrect) {
                // to hide password
                doc.password = null;

                const token = jwt.createJWT(doc);
                if (token) {
                    doc.token = token;
                }
                res.status(STATUS_CODE.OK).json({ data: doc, statusCode: STATUS_CODE.OK });
                return
            }
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Invalid email and password", statusCode: STATUS_CODE.BAD_REQUEST });
            return;
        }
        res.status(STATUS_CODE.NOT_FOUND).json({ message: "User not found", statusCode: STATUS_CODE.NOT_FOUND });

    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
    }
})


const validate = catchAsync(async (req, res) => {
    try {

        let email = req.body.email;
        if (!email) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Email is required" });
            return;
        }
        const isExist = await userModel.findOne({ email });
        if (isExist) {
            res.status(STATUS_CODE.DUPLICATE).json({ message: ERRORS.UNIQUE.ALREADY_EMAIL });
            return;
        }

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS });

    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
    }


})
const genrateEmailVerificationCode = catchAsync(async (req, res, next) => {
    try {

        let email = req.body.email;
        if (!email) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Email is required" });
            return;
        }
        const isExist = await userModel.findOne({ email });
        if (isExist) {
            res.status(STATUS_CODE.DUPLICATE).json({ message: ERRORS.UNIQUE.ALREADY_EMAIL });
            return;
        }

        const createUserWithEmail = new userModel({ email })
        let genrateCode = await createUserWithEmail.createEmailVerifyToken();

        let sendCode = await SendEmail({ email: createUserWithEmail?.email, subject: "MADRASA.IO AUTHENTICATION", code: genrateCode }, next)

        await createUserWithEmail.save();

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS });

    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
    }
})
const verifyEmailCode = catchAsync(async (req, res, next) => {
    try {
        let { email, code } = req.body;
        if (!email) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Email is required" });
            return;
        }
        if (!code || code.length != 6 || isNaN(code)) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.INVALID_CODE });
            return;
        }
        const UserData = await userModel.findOne({ email });
        if (!UserData) {
            res.status(STATUS_CODE.NOT_FOUND).json({ message: ERRORS.INVALID.NOT_FOUND_EMAIL });
            return;
        }

        let verifyCode = await UserData.verifyEmail({ email: UserData.email, token: code });
        if (!verifyCode) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.WRONG_CODE });
            return;
        }

        await UserData.save();

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.ACCOUNT_VERIFICATION });

    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
    }
})
const addPassword = catchAsync(async (req, res, next) => {

    let { email, firstName, lastName, role, gender, password, code } = req.body;
    console.log("---------> ", email);
    try {
        if (!email || !firstName || !lastName || !role || !gender || !password || !code) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: ["email", "firstName", "lastName", "role", "gender", "password", "code"] })
            return
        }

        let UserData = await userModel.findOne({ email })
        if (!UserData) {
            res.status(STATUS_CODE.NOT_FOUND).json({ message: ERRORS.INVALID.USER_NOT_FOUND })
            return
        }
        if (UserData.status != "pending") {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.ALREADY.ACCOUNT_EXIST })
            return
        }

        // REMOVED AFTER ADDING TOKEN AUTH :
        let verifyCode = await UserData.verifyEmail({ email: UserData.email, token: code });
        if (!verifyCode) {
            res.status(STATUS_CODE.FORBIDDEN).json({ message: ERRORS.UNAUTHORIZED.UNABLE });
            return;
        }

        if (password.length <= 7) {
            res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.INVALID.PASSWORD_LENGTH })
            return
        }



        UserData.firstName = firstName;
        UserData.lastName = lastName;
        UserData.role = role;
        UserData.gender = gender;
        UserData.status = "created"

        const hashPassword = await bycrypt.hashPassword(password);
        if (!hashPassword) {
            res.status(STATUS_CODE.SERVER_ERROR).json({ message: "Hashing Error" });
            return;
        }
        UserData.password = hashPassword;

        await UserData.save();
        UserData.password = null

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.ACCOUNT_CREATED_SUCCESS, result: UserData })

    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
    }

})




module.exports = { login, validate, genrateEmailVerificationCode, verifyEmailCode, addPassword }



// exports.signup = catchAsync(async (req, res) => {
//     try {

//         let email = req.body.email;
//         let password = req.body.password;
//         if (!email) {
//             res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Email is required", statusCode: STATUS_CODE.BAD_REQUEST });
//             return;
//         }
//         if (!password) {
//             res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Password is required", statusCode: STATUS_CODE.BAD_REQUEST });
//             return;
//         }
//         const isExist = await userModel.findOne({ email });
//         if (isExist) {
//             res.status(STATUS_CODE.BAD_REQUEST).json({ message: "User already exist with same email", statusCode: STATUS_CODE.BAD_REQUEST });
//             return;
//         }

//         const hashPassword = await bycrypt.hashPassword(password);
//         if (hashPassword) {
//             req.body.password = hashPassword;
//             const data = new userModel(req.body);
//             await data.save()
//             res.status(STATUS_CODE.OK).json({ message: `${req.body.role} created successfully`, statusCode: STATUS_CODE.CREATED });
//             return;
//         }

//         res.status(STATUS_CODE.SERVER_ERROR).json({ message: `Unable to hash password`, message:ERRORS. });
//         return;

//     } catch (err) {
//         res.status(STATUS_CODE.SERVER_ERROR).json({ message:ERRORS.PROGRAMMING.SOME_ERROR , err });
//     }


// })
// exports.verify = catchAsync(async (req, res) => {

//     try {
//         let token = req.body.token;
//         if (token) {
//             const payload = jwt.verify(token);
//             if (payload && payload.userdata) {
//                 let user = await userModel.findOne({ _id: payload.userdata.id });
//                 if (user) {
//                     const token = jwt.createJWT(user);
//                     if (token) {
//                         user.token = token;
//                     }
//                     res.status(STATUS_CODE.OK).json({ message: "User verified successfully", data: user, statusCode: STATUS_CODE.OK });
//                     return;
//                 }
//             }
//         }

//         res.status(STATUS_CODE.UNAUTHORIZED).json({ message: "Unauthorized access", statusCode: STATUS_CODE.UNAUTHORIZED });
//         return;
//     } catch (err) {
//         res.status(STATUS_CODE.SERVER_ERROR).json({ message: "Authorization Error", message:ERRORS. });
//         return;
//     }

// })
// exports.verifyEmailVerificationCode = catchAsync(async (req, res) => {

//     try {
//         let email = req.body.email;
//         let code = req.body.code;
//         if (!email) {
//             res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Email is required", statusCode: STATUS_CODE.BAD_REQUEST });
//             return;
//         }
//         if (!code) {
//             res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Verification code is required", statusCode: STATUS_CODE.BAD_REQUEST });
//             return;
//         }

//         code = crypto
//             .createHash("sha256")
//             .update(code)
//             .digest("hex");

//         let user = await userModel.findOneAndUpdate({ email, emailVerificationCode: code, emailVerificationTokenExpires: { $gte: Date.now() } }, {
//             $set: {
//                 isEmailVerified: true,
//             }
//         });

//         if (!user) {
//             res.status(STATUS_CODE.NOT_FOUND).json({ message: "Invalid Token or Token Expired", statusCode: STATUS_CODE.NOT_FOUND });
//             return;
//         }

//         res.status(STATUS_CODE.OK).json({ statusCode: STATUS_CODE.OK, data: user, message: "User email verified successfully" });

//     } catch (err) {
//         console.log(err);
//         res.status(STATUS_CODE.SERVER_ERROR).json({ message: "Verification code verify error", message:ERRORS. });
//         return;
//     }

// })