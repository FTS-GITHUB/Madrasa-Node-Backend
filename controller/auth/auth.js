const express = require("express");

// Models :
const userModel = require("../../model/user");

// Helpers :
const jwt = require("../../utils/jwt");
const bycrypt = require("../../utils/bycrypt");
const SendEmail = require("../../utils/emails/sendEmail");
const crypto = require("crypto");
const catchAsync = require("../../utils/catchAsync");
const { STATUS_CODE, ERRORS, SUCCESS_MSG, ROLES } = require("../../constants/index");
const { GoogleClient } = require("../../utils/GoogleOthClient");
const { createStripeAccount } = require("../../utils/Stripe");
const RoleModel = require("../../model/role");
const { log } = require("console");






const login = catchAsync(async (req, res) => {
    try {
        console.log("hit")
        let email = req.body.email,
            password = req.body.password;
        if (!email || !password) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: `${!email ? "Email" : "Password"} is required.` });
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
                res.status(STATUS_CODE.OK).json({ result: doc, statusCode: STATUS_CODE.OK });
                return
            }
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Invalid email and password" });
            return;
        }
        res.status(STATUS_CODE.NOT_FOUND).json({ message: "User not found" });

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

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.TOKEN_SENT_EMAIL });

    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
    }
})
const changeEmail = catchAsync(async (req, res, next) => {
    try {
        let { email, newEmail } = req.body;
        if (!email) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Email is required" });
            return;
        }
        if (!newEmail) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "New Email is required" });
            return;
        }

        const UserData = await userModel.findOne({ email });
        if (!UserData) {
            res.status(STATUS_CODE.NOT_FOUND).json({ message: ERRORS.INVALID.NOT_FOUND_EMAIL });
            return;
        }

        UserData.email = newEmail

        let genrateCode = await UserData.createEmailVerifyToken();
        let sendCode = await SendEmail({ email: UserData?.email, subject: "MADRASA.IO AUTHENTICATION", code: genrateCode }, next)

        await UserData.save();

        res.status(STATUS_CODE.OK).json({ message: "Email updated Successful." });

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
        if (verifyCode == "expired") {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.INVALID_VERIFICATION_TOKEN });
            return;
        } else if (!verifyCode) {
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

        const roleData = await RoleModel.findOne({ _id: role })
        // Create Stripe Account
        if (roleData.name == ROLES.TEACHER) {
            let customer = await createStripeAccount(firstName, email)
            if (customer) {
                UserData.stripId = customer?.id
            }
            else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.STRIP_ERROR });
            }
        }

        await UserData.save();
        UserData.password = null

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.ACCOUNT_CREATED_SUCCESS, result: UserData })

    } catch (err) {
        console.log("hsdakjhfdlhf", err)
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
    }

})


const genrateForgetEmailVerificationCode = catchAsync(async (req, res, next) => {
    try {

        let email = req.body.email;
        if (!email) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Email is required" });
            return;
        }
        const UserData = await userModel.findOne({ email });
        if (!UserData) {
            res.status(STATUS_CODE.NOT_FOUND).json({ message: ERRORS.INVALID.USER_NOT_FOUND });
            return;
        }

        let genrateCode = await UserData.createEmailVerifyToken();

        let sendCode = await SendEmail({ email: UserData?.email, subject: "MADRASA.IO AUTHENTICATION", code: genrateCode }, next)

        await UserData.save();

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.TOKEN_SENT_EMAIL });

    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
    }
})
const resetPassword = catchAsync(async (req, res, next) => {

    let { email, password, code } = req.body;
    try {
        if (!email || !password || !code) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: ["email", "password", "code"] })
            return
        }

        let UserData = await userModel.findOne({ email })
        if (!UserData) {
            res.status(STATUS_CODE.NOT_FOUND).json({ message: ERRORS.INVALID.USER_NOT_FOUND })
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

        const hashPassword = await bycrypt.hashPassword(password);
        if (!hashPassword) {
            res.status(STATUS_CODE.SERVER_ERROR).json({ message: "Hashing Error" });
            return;
        }
        UserData.password = hashPassword;

        await UserData.save();
        UserData.password = null

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.PASSWORD_RESET, result: UserData })

    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
    }

})

const googleLogin = catchAsync(async (req, res, next) => {

    try {
        let { token } = req.body;

        const verifyGoogleToken = await GoogleClient.verifyIdToken({
            idToken: token
        })

        let userData = verifyGoogleToken.getPayload()

        if (userData) {
            const findUser = await userModel.findOne({ email: userData?.email })
            if (findUser) {
                const token = jwt.createJWT(findUser);
                if (!token) {
                    return res.status(STATUS_CODE.NOT_FOUND).json({ message: ERRORS.INVALID.USER_NOT_FOUND });
                }
                findUser.token = token;
                res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result: findUser });
            } else {
                res.status(STATUS_CODE.NOT_FOUND).json({ message: ERRORS.INVALID.USER_NOT_FOUND, userData });
            }
        }

    } catch (err) {
        console.log("-------- ERROR ---------- ", err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
    }

})


module.exports = { login, validate, genrateEmailVerificationCode, changeEmail, verifyEmailCode, addPassword, genrateForgetEmailVerificationCode, resetPassword, googleLogin }