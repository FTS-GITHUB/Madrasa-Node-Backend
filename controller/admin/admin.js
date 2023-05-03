const roles = require("../../constants/roles");
const STATUS_CODE = require("../../constants/statusCode");
const userModel = require("../../model/user");
const bycrypt = require("../../utils/bycrypt");
const catchAsync = require("../../utils/catchAsync");

exports.addAdmin = catchAsync(async (req, res) => {
    try {

        let email = req.body.email;
        let password = req.body.password;
        req.body.role = roles.ADMIN;
        if (!email) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Email is required", statusCode: STATUS_CODE.BAD_REQUEST });
            return;
        }
        if (!password) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Password is required", statusCode: STATUS_CODE.BAD_REQUEST });
            return;
        }
        const isExist = await userModel.findOne({ email });
        if (isExist) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Admin already exist with same email", statusCode: STATUS_CODE.BAD_REQUEST });
            return;
        }

        const hashPassword = await bycrypt.hashPassword(password);
        if (hashPassword) {
            req.body.password = hashPassword;
            const data = new userModel(req.body);
            await data.save()
            res.status(STATUS_CODE.OK).json({ message: `Admin created successfully`, statusCode: STATUS_CODE.CREATED });
            return;
        }

        res.status(STATUS_CODE.SERVER_ERROR).json({ message: `Unable to hash password`, statusCode: STATUS_CODE.SERVER_ERROR });
        return;

    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR, err });
    }
})

exports.addCustomer = catchAsync(async (req, res) => {
    try {

        let email = req.body.email;
        let password = req.body.password;
        req.body.role = roles.CUSTOMER;
        if (!email) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Email is required", statusCode: STATUS_CODE.BAD_REQUEST });
            return;
        }
        if (!password) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Password is required", statusCode: STATUS_CODE.BAD_REQUEST });
            return;
        }
        const isExist = await userModel.findOne({ email });
        if (isExist) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Customer already exist with same email", statusCode: STATUS_CODE.BAD_REQUEST });
            return;
        }

        const hashPassword = await bycrypt.hashPassword(password);
        if (hashPassword) {
            req.body.password = hashPassword;
            const data = new userModel(req.body);
            await data.save()
            res.status(STATUS_CODE.OK).json({ message: `Customer created successfully`, statusCode: STATUS_CODE.CREATED });
            return;
        }

        res.status(STATUS_CODE.SERVER_ERROR).json({ message: `Unable to hash password`, statusCode: STATUS_CODE.SERVER_ERROR });
        return;

    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR, err });
    }
})

exports.editAdmin = catchAsync(async (req, res) => {
    try {
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let password = req.body.password;

        let data = {};
        if (firstName) data.firstName = firstName;
        if (lastName) data.lastName = lastName;
        if (password) {
            const hashPassword = await bycrypt.hashPassword(password);
            if (hashPassword) {
                data.password = hashPassword;
            } else {
                res.status(STATUS_CODE.SERVER_ERROR).json({ message: `Unable to hash password`, statusCode: STATUS_CODE.SERVER_ERROR });
                return;
            }
        }

        if (Object.entries(data).length === 0) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: `Please provide some data to modify`, statusCode: STATUS_CODE.BAD_REQUEST });
            return;
        }

        let docs = await userModel.updateOne({ _id: req.params.id, role: [roles.ADMIN, roles.SUPERADMIN] }, {
            $set: data,
        })

        if (docs.modifiedCount) {
            res.status(STATUS_CODE.OK).json({ message: `Admin profile updated successfully`, statusCode: STATUS_CODE.OK });
            return;
        }

        res.status(STATUS_CODE.BAD_REQUEST).json({ message: `Admin profile updatetion failed`, statusCode: STATUS_CODE.BAD_REQUEST });
        return;



    } catch (err) {
        console.log(err)
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: `Server error occur`, statusCode: STATUS_CODE.SERVER_ERROR });
    }
})


exports.deleteAdmin = catchAsync(async (req, res) => {
    try {
        if (!req.params.id) {

            res.status(STATUS_CODE.BAD_REQUEST).json({ message: `Id is required`, statusCode: STATUS_CODE.BAD_REQUEST });
            return;
        }
        let docs = await userModel.updateOne({ _id: req.params.id, role: [roles.ADMIN, roles.SUPERADMIN] }, {
            $set: {
                archived: true,
            },
        })

        if (docs.modifiedCount) {
            res.status(STATUS_CODE.OK).json({ message: `Admin deleted successfully`, statusCode: STATUS_CODE.OK });
            return;
        }

        res.status(STATUS_CODE.BAD_REQUEST).json({ message: `Admin delete failed`, statusCode: STATUS_CODE.BAD_REQUEST });
        return;



    } catch (err) {
        console.log(err)
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: `Server error occur`, statusCode: STATUS_CODE.SERVER_ERROR });
    }
})

exports.deleteMultipleAdmins = catchAsync(async (req, res, next) => {
    try {
        let userIDs = req.body;
        if (!Array.isArray(userIDs)) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: `Id's are required`, statusCode: STATUS_CODE.BAD_REQUEST });
            return;
        }

        let result = await userModel.deleteMany({ _id: { $in: userIDs } })

        res.status(STATUS_CODE.OK).json({
            message: "Admins Deleted Success",
            result
        })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: `Admin delete failed`, statusCode: STATUS_CODE.BAD_REQUEST });
    }
})
