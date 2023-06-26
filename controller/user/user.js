const express = require("express");

// Models :
const userModel = require("../../model/user");

// MiddleWares :
const bycrypt = require("../../utils/bycrypt");
const catchAsync = require("../../utils/catchAsync");
const { uploadFile } = require("../../utils/uploader")

// Helerps :
const roles = require("../../constants/roles");
const { STATUS_CODE, SUCCESS_MSG, ERRORS } = require("../../constants/index");





const getProfile = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result: currentUser });
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR });
    }
})

const updateAccount = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;

        //Parsing profileImage :
        if (req.body.profileImage) {
            req.body.profileImage = JSON.parse(req.body.profileImage)
        }

        if (req.file) {
            req.body.profileImage = await uploadFile(req.file, currentUser?.profileImage?.url || null);
        }
        if (req.body.password) {
            const hashPassword = await bycrypt.hashPassword(req.body.password);
            if (hashPassword) {
                req.body.password = hashPassword;
            } else {
                res.status(STATUS_CODE.SERVER_ERROR).json({ message: `Unable to hash password` });
                return;
            }
        }

        let result = await userModel.findOneAndUpdate({ _id: req.user._id }, req.body, { new: true });

        if (result) {
            res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE, result: result });
            return;
        }

        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.OPERATION_FAILED });
    } catch (err) {
        console.log(err)
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
    }
})



const getAllUser = catchAsync(async (req, res) => {
    const currentUser = req.user;
    try {
        let result = await userModel.find({ _id: { $nin: [currentUser?._id] } })
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result });
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR });
    }
})




// Get Just Teachers
const getTeacherUser = catchAsync(async (req,res)=>{
    try{
        let FindAllUsers = await userModel.find({}).populate('role')
        let result = [];
        if(FindAllUsers){
            FindAllUsers.filter((data)=>{
                if(data?.role?.name=='teacher'){
                    result.push(data)        
                }
            })
                }
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result });
    }catch(err){
        console.log("this is error", err)
        return res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR });

    }
})





const addNewUserByAdmn = catchAsync(async (req, res, next) => {
    try {
        let { firstName, lastName, email, role, gender, password } = req.body;
        if (!email || !firstName || !lastName || !role || !gender || !password) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: ["email", "firstName", "lastName", "role", "gender", "password"] })
            return
        }

        const isExist = await userModel.findOne({ email });
        if (isExist) {
            res.status(STATUS_CODE.DUPLICATE).json({ message: ERRORS.UNIQUE.ALREADY_EMAIL });
            return;
        }
        if (password.length <= 7) {
            res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.INVALID.PASSWORD_LENGTH })
            return
        }

        if (req.file) {
            req.body.profileImage = await uploadFile(req.file, null);
        }

        const hashPassword = await bycrypt.hashPassword(password);
        if (!hashPassword) {
            res.status(STATUS_CODE.SERVER_ERROR).json({ message: "Hashing Error" });
            return;
        }
        req.body.password = hashPassword;

        req.body.status = "approved";

        const UserData = new userModel(req.body);
        await UserData.save();

        UserData.password = null;
        res.status(STATUS_CODE.CREATED).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.ACCOUNT_CREATED_SUCCESS, result: UserData })

    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
    }
})

const getUserById = catchAsync(async (req, res) => {
    try {
        let _id = req.params.id;
        if (!_id) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: ["ID"] });
            return;
        }
        let result = await userModel.findOne({ _id })
        if (!result) {
            res.status(STATUS_CODE.NOT_FOUND).json({ message: ERRORS.INVALID.NOT_FOUND });
        }

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result });
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
    }
})

const reviewUser = catchAsync(async (req, res, next) => {
    try {
        let { userId, status, role } = req.body;
        if (!userId || !status || !role) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: ["userId , status", "role"] });
            return;
        }

        let userData = await userModel.findByIdAndUpdate(userId, { status, role }, { new: true })

        if (!userData) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.USER_NOT_FOUND });
            return;
        }
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result: userData });
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
    }
});

const deleteUser = catchAsync(async (req, res, next) => {
    try {
        let { userId } = req.params;
        if (!userId) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: ["userId -PARAMS"] });
            return;
        }

        let userData = await userModel.findByIdAndDelete(userId)

        if (!userData) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.USER_NOT_FOUND });
            return;
        }
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL });
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
    }
});


// Here to start Edit Profile User Data API

const EditProfile = catchAsync(async (req, res) => {
    let userData = req.body
    let userId = req.params.id
    let { confirmPassword, ...newData } = userData
    // console.log("this is user id", userId, "this is userData", userData)
    try {
        if (userData?.password != userData?.confirmPassword) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Password Not Same" })
        }
        if (userData?.password?.length < 8 || userData?.confirmPassword?.length < 8) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Password Must be Greater Then 8" })
        }
        if (newData.password) {
            const hashPassword = await bycrypt.hashPassword(newData.password);
            if (hashPassword) {
                newData.password = hashPassword;
            }
        }
        if (req.file) {
            newData.profileImage = await uploadFile(req.file, newData?.profileImage?.url || null);
        }
        const FindOne = await userModel.findById(userId)
        if (FindOne) {
            result = await userModel.findByIdAndUpdate(userId, newData, { new: true }).populate('role')
            // console.log("Find SuccessFully", newData)
        }
        else {
            console.log("User Not Found")
        }
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result });
    } catch (err) {
        console.log(err)
        return res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})
const AddEducation = catchAsync(async (req, res) => {
    let userData = req.body
    let userId = req.params.id
    // console.log("this is user id", userId, "this is userData", userData)
    try {
        if (req.file) {
            userData.image = await uploadFile(req.file, userData?.image?.url || null);
        }
        const FindOne = await userModel.findById(userId)
        if (FindOne) {
            result = await userModel.findByIdAndUpdate(userId, { $push: { education: userData } }, { new: true }).populate('role')
            // console.log("Find SuccessFully", newData)
        }
        else {
            console.log("User Not Found")
        }
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result });
    } catch (err) {
        console.log(err)
        return res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})
const AddWork = catchAsync(async (req, res) => {
    let userData = req.body
    let userId = req.params.id
    // console.log("this is user id", userId, "this is userData", userData)
    try {
        if (req.file) {
            userData.image = await uploadFile(req.file, userData?.image?.url || null);
        }
        const FindOne = await userModel.findById(userId)
        if (FindOne) {
            result = await userModel.findByIdAndUpdate(userId, { $push: { work: userData } }, { new: true }).populate('role')
            // console.log("Find SuccessFully", userData)
        }
        else {
            console.log("User Not Found")
        }
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result });
    } catch (err) {
        console.log(err)
        return res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


module.exports = { getProfile, updateAccount, getAllUser,getTeacherUser, addNewUserByAdmn, getUserById, reviewUser, deleteUser, EditProfile, AddEducation, AddWork }
