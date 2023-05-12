const STATUS_CODE = require("../../constants/statusCode");
const category = require("../../model/category");
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MESSAGES } = require('../../constants/success')
const ROLES = require('../../constants/roles')


// This is the Category Post API
const addCategory = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body

    data.user = currentUser?._id

    try {
        if (!data.name || data.name == "") {
            res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.BAD_REQUEST, message: "Name Required" })
        }
        const newData = new category(data)
        await newData.save()
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MESSAGES.CREATED, result: newData })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Category Get API
const getAllCategory = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        let result;
        if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(currentUser.role)) {
            result = await category.find({});
        } else {
            result = await category.find({ auther: currentUser._id });
        }
        // const result = await category.find({ [currentUser.role]: currentUser._id });
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Category Get One Data API
const getCategoryById = catchAsync(async (req, res) => {
    let categoryId = req.params.id
    try {
        const result = await category.findById(categoryId);
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})


// This is the Category Delete API
const deleteCategoryById = catchAsync(async (req, res) => {
    const categoryId = req.params.id
    try {
        const result = await category.findByIdAndDelete(categoryId);
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MESSAGES.DELETE })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

module.exports = { addCategory, getAllCategory, getCategoryById, deleteCategoryById };