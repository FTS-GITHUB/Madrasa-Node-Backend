const STATUS_CODE = require("../../constants/statusCode");
const category = require("../../model/category");
const catchAsync = require("../../utils/catchAsync");


// This is the Category Post API
exports.categoryPost = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body

    data.user = currentUser?._id

    try {
        const newData = new category(data)
        await newData.save()
        console.log("Store Data SucccessFully")
        res.status(STATUS_CODE.OK).json({ message: `Category Detail Inserted SuccessFully`, result: newData, statusCode: STATUS_CODE.CREATED })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }

})

// This is the Category Get API
exports.categoryGet = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        const result = await category.find({ [currentUser.role]: currentUser._id });
        res.status(STATUS_CODE.OK).json({ result, message: "Data Fatched SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Category Patch API
exports.categoryPatch = catchAsync(async (req, res) => {
    const updateData = req.body
    const categoryId = req.params.id;
    try {
        let currentUser = req.user;
        const result = await category.findOneAndUpdate({ [currentUser.role]: currentUser._id, _id: categoryId }, { $set: updateData });
        res.status(STATUS_CODE.OK).json({ result, message: "Data Updated SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Category Delete API
exports.categoryDelete = catchAsync(async (req, res) => {
    const categoryId = req.params.id
    try {
        let currentUser = req.user;
        const result = await category.findOneAndDelete({ [currentUser.role]: currentUser._id, _id: categoryId });
        res.status(STATUS_CODE.OK).json({ result, message: "Data Delete SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})