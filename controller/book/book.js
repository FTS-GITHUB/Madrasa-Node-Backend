const book = require("../../model/book");
const catchAsync = require("../../utils/catchAsync");
const { uploadFile } = require("../../utils/uploader");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index")


// This is the Book Post API
const addBook = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body
    data.auther = currentUser?._id
    data.category = req.body.category

    try {
        console.log(data)
        if (!data) {
            res.status(STATUS_CODE.ALREADY).json({ message: ERRORS.REQUIRED.FIELD })
        }
        if (req.file) {
            data.image = await uploadFile(req.file, data?.image?.url || null);
        }
        // data.bookFile = await uploadArrayOfFiles(req.file,data?.bookFile?.url || null)
        const newData = new book(data)
        await newData.save()
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.CREATED, result: newData })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }

})

// This is the Book Get API
const getAllBook = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        let result;
        if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(currentUser.role)) {
            result = await book.find({});
        } else {
            result = await book.find({ auther: currentUser._id });
        }
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the book Get One Data API
const getBookById = catchAsync(async (req, res) => {
    let bookId = req.params.id
    try {
        const result = await book.findById(bookId);
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the get All Public Books Which is Approve Data API
const getPublicBook = catchAsync(async (req, res) => {
    try {
        const result = await book.find({ status: "approved" })
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is update Review Book API
const reviewBook = catchAsync(async (req, res) => {
    const { bookId, status } = req.body;
    try {
        const FindOne = await book.findOne({ _id: bookId, status: "pending" })
        if (FindOne) {
            if (FindOne.status == "approved" || FindOne.status == "rejected") {
                res.status(STATUS_CODE.BAD_REQUEST).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.ALREADY })
            } else {
                const result = await book.findOneAndUpdate({ _id: bookId }, { $set: { status: status } }, { new: true })
                return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE, result })
            }
        } else {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.ALREADY })
        }
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Book Patch API
const updateBookById = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body
    const bookId = req.params.id;
    try {
        // console.log(data)
        if (data.status) {
            res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.UNAUTHORIZED.UNAUTHORIZE })
        }
        if (data.isImgDel == "true") {
            data.image = {};
        } else {
            if (req.file) {
                data.image = await uploadFile(req.file, data?.image?.url || null);
            }
        }
        data.status = "pending";
        const result = await book.findByIdAndUpdate(bookId, data, { new: true });
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Book Delete API
const deleteBookById = catchAsync(async (req, res) => {
    const currentUser = req.user
    const bookId = req.params.id
    try {
        const FindOne = await book.findById(bookId);
        if (FindOne) {
            let result;
            if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(currentUser.role)) {
                result = await book.findByIdAndDelete(bookId);
            } else {
                result = await book.findOneAndDelete({ _id: bookId, auther: currentUser._id });

            }
            res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE })
        }
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

module.exports = { addBook, getAllBook, getPublicBook, getBookById, reviewBook, updateBookById, deleteBookById };