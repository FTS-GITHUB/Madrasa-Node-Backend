const STATUS_CODE = require("../../constants/statusCode");
const book = require("../../model/book");
const catchAsync = require("../../utils/catchAsync");


// This is the Book Post API
exports.bookPost = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body

    data.user = currentUser?._id

    try {
        const newData = new book(data)
        await newData.save()
        console.log("Store Data SucccessFully")
        res.status(STATUS_CODE.OK).json({ message: `book Detail Inserted SuccessFully`, result: newData, statusCode: STATUS_CODE.CREATED })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }

})

// This is the Book Get API
exports.bookGet = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        const result = await book.find({ [currentUser.role]: currentUser._id });
        res.status(STATUS_CODE.OK).json({ result, message: "Data Fatched SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Book Patch API
exports.bookPatch = catchAsync(async (req, res) => {
    const updateData = req.body
    const bookId = req.params.id;
    try {
        let currentUser = req.user;
        const result = await book.findOneAndUpdate({ [currentUser.role]: currentUser._id, _id: bookId }, { $set: updateData });
        res.status(STATUS_CODE.OK).json({ result, message: "Data Updated SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Book Delete API
exports.bookDelete = catchAsync(async (req, res) => {
    const bookId = req.params.id
    try {
        let currentUser = req.user;
        const result = await book.findOneAndDelete({ [currentUser.role]: currentUser._id, _id: bookId });
        res.status(STATUS_CODE.OK).json({ result, message: "Data Delete SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})