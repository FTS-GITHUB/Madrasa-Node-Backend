const roles = require("../../constants/roles");
const { STATUS_CODE, SUCCESS_MSG } = require("../../constants/index");
const userModel = require("../../model/user");
const bycrypt = require("../../utils/bycrypt");
const saveFileToPublic = require("../../utils/saveFileToPublic");
const catchAsync = require("../../utils/catchAsync");
const { uploadFile } = require("../../utils/uploader")

exports.approve = catchAsync(async (req, res, next) => {
    try {
        let _id = req.params.id;
        let approved = req.params.status;
        if (!_id) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Id is required.", statusCode: STATUS_CODE.BAD_REQUEST });
            return;
        }
        if (!approved) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "status is required.", statusCode: STATUS_CODE.BAD_REQUEST });
            return;
        }
        await userModel.updateOne({ _id }, {
            $set: {
                approved,
            }
        })
            .then(doc => {
                if (doc.modifiedCount) {
                    res.status(STATUS_CODE.OK).json({ message: `Approved status is set to ${approved} successfully.`, statusCode: STATUS_CODE.OK });
                    return;
                }
                res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Unable to approve.", statusCode: STATUS_CODE.BAD_REQUEST });
            })
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR });
    }
})

exports.ban = catchAsync(async (req, res) => {
    try {
        let _id = req.params.id;
        let banned = req.params.status;
        if (!_id) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Id is required.", statusCode: STATUS_CODE.BAD_REQUEST });
            return;
        }
        if (!banned) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "status is required.", statusCode: STATUS_CODE.BAD_REQUEST });
            return;
        }
        await userModel.updateOne({ _id }, {
            $set: {
                banned,
            }
        })
            .then(doc => {
                if (doc.modifiedCount) {
                    res.status(STATUS_CODE.OK).json({ message: `banned status is set to ${banned} successfully.`, statusCode: STATUS_CODE.OK });
                    return;
                }
                res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Unable to ban.", statusCode: STATUS_CODE.BAD_REQUEST });
            })
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR });
    }
})

exports.getProfile = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result: currentUser });
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR });
    }
})

exports.getUserById = catchAsync(async (req, res) => {
    try {
        let _id = req.params.id;
        if (!_id) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Id is required.", statusCode: STATUS_CODE.BAD_REQUEST });
            return;
        }
        await userModel.findOne({ _id })
            .then(doc => {
                if (doc) {
                    res.status(STATUS_CODE.OK).json({ data: doc, statusCode: STATUS_CODE.OK });
                    return;
                }
                res.status(STATUS_CODE.NOT_FOUND).json({ message: "Not found", statusCode: STATUS_CODE.NOT_FOUND });
            })
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR });
    }
})

exports.updateAccount = catchAsync(async (req, res) => {

    console.log("------->", req.body);

    try {

        let currentUser = req.user;
        console.log("*******>", currentUser);

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

        let result = await userModel.findOneAndUpdate({ _id: req.user._id }, req.body, { returnOriginal: false });

        if (result.isModified) {
            res.status(STATUS_CODE.OK).json({ message: `Profile updated successfully`, result: result });
            return;
        }

        res.status(STATUS_CODE.BAD_REQUEST).json({ message: `Profile updatetion failed`, statusCode: STATUS_CODE.BAD_REQUEST });
    } catch (err) {
        console.log(err)
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: `Server error occur`, statusCode: STATUS_CODE.SERVER_ERROR });
    }
})

exports.getAllUser = catchAsync(async (req, res) => {
    const currentUser = req.user;
    try {
        let result = await userModel.find({ _id: { $nin: [currentUser?._id] } })
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result });
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR });
    }
})
