const STATUS_CODE = require("../../constants/statusCode");
const book = require("../../model/book");
const catchAsync = require("../../utils/catchAsync");


// This is the Book Post API
const addBook = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body

    data.user = currentUser?._id

    try {
        const newData = new book(data)
        await newData.save()
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.CREATED,result: newData})
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }

})

// This is the Book Get API
const getAllBook = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        const result = await book.find({ [currentUser.role]: currentUser._id });
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result})
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the book Get One Data API
const getBookById = catchAsync(async (req, res) => {
    let bookId = req.params.id
    try {
        const result = await book.findById(bookId );
        res.status(STATUS_CODE.OK).json({message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS ,result})
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Book Patch API
const updateBookById = catchAsync(async (req, res) => {
    const updateData = req.body
    const bookId = req.params.id;
    try {
        const result = await book.findOneAndUpdate(bookId , { $set: updateData });
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS ,result})
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Book Delete API
const deleteBookById = catchAsync(async (req, res) => {
    const bookId = req.params.id
    try {
        const result = await book.findOneAndDelete(bookId );
        res.status(STATUS_CODE.OK).json({message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE,result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

module.exports = {addBook, getAllBook, getBookById, updateBookById , deleteBookById};