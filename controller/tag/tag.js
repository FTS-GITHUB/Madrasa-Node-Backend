const tag = require("../../model/tag");
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index")



// This is the tag Post API
const addTag = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body

    try {
        if (!data || !data.length >= 1 || data.includes(" ")) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELD })
        }
        let result = []

        let CreatingCategories = data.map(async (val) => {
            let res = await tag.create({ name: val })
            result.push(res)
        });

        await Promise.all(CreatingCategories)
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.CREATED, result })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the tag Get API
const getAllTag = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;

        let result = await tag.find();
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the tag Get One Data API
const getTagById = catchAsync(async (req, res) => {
    let tagId = req.params.id
    try {
        const result = await tag.findById(tagId);
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


// This is the tag Delete API
const deleteTagById = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const tagId = req.params.id
    try {
        let result = await tag.findOneAndDelete({ _id: tagId });
        if (result) {
            return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE })
        }
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

module.exports = { addTag, getAllTag, getTagById, deleteTagById };