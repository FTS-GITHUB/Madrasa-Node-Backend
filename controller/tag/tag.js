const STATUS_CODE = require("../../constants/statusCode");
const tag = require("../../model/tag");
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MESSAGES } = require('../../constants/success')
const ROLES = require('../../constants/roles')


// This is the tag Post API
const addTag = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body

    data.user = currentUser?._id

    try {
        if (!data.name || data.name == "") {
            res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.BAD_REQUEST, message: "Name Required" })
        }
        const newData = new tag(data)
        await newData.save()
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MESSAGES.CREATED, result: newData })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the tag Get API
const getAllTag = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        let result;
        if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(currentUser.role)) {
            result = await tag.find({});
        } else {
            result = await tag.find({ auther: currentUser._id });
        }
        // const result = await tag.find({ [currentUser.role]: currentUser._id });
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the tag Get One Data API
const getTagById = catchAsync(async (req, res) => {
    let tagId = req.params.id
    try {
        const result = await tag.findById(tagId);
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})


// This is the tag Delete API
const deleteTagById = catchAsync(async (req, res) => {
    const tagId = req.params.id
    try {
        const result = await tag.findByIdAndDelete(tagId);
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MESSAGES.DELETE })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

module.exports = { addTag, getAllTag, getTagById, deleteTagById };