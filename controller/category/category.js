const STATUS_CODE = require("../../constants/statusCode");
const category = require("../../model/category");
const catchAsync = require("../../utils/catchAsync");


// This is the Category Post API
const addCategory = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body

    data.user = currentUser?._id

    try {
        const newData = new category(data)
        await newData.save()
        res.status(STATUS_CODE.OK).json({ message: `Category Detail Inserted SuccessFully`, result: newData})
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }

})

// This is the Category Get API
const getAllCategory = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        const result = await category.find({ [currentUser.role]: currentUser._id });
        res.status(STATUS_CODE.OK).json({ result:result, message: "Data Fatched SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Category Get One Data API
const getCategoryById = catchAsync(async (req, res) => {
    let categoryId = req.params.id
    try {
        const result = await category.findById(categoryId );
        res.status(STATUS_CODE.OK).json({ result:result, message: "Data Fatched SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Category Patch API
const updateCategoryById = catchAsync(async (req, res) => {
    const updateData = req.body
    const categoryId = req.params.id;
    try {
        const result = await category.findByIdAndUpdate(categoryId , { $set: updateData });
        res.status(STATUS_CODE.OK).json({ result:result, message: "Data Updated SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Category Delete API
const deleteCategoryById = catchAsync(async (req, res) => {
    const categoryId = req.params.id
    try {
        let currentUser = req.user;
        const result = await category.findByIdAndDelete(categoryId);
        res.status(STATUS_CODE.OK).json({ result:result, message: "Data Delete SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

module.exports = {addCategory, getAllCategory, getCategoryById, updateCategoryById , deleteCategoryById};