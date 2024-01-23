const book = require("../../model/book");
const catchAsync = require("../../utils/catchAsync");
const { uploadFile } = require("../../utils/uploader");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index")


// This is the Book Post API
const addBook = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body
    data.auther = currentUser?._id

    try {
        // console.log(req.body)
        if (!data.title || data.title == "" || !data.detail || data.detail == "") {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELD })
        }
        if (req?.files?.cover) {
            data.image = await uploadFile(req?.files?.cover[0], data?.image?.url || null);
        }
        if (req?.files?.file) {
            data.file = await uploadFile(req?.files?.file[0], null);
        }
        const newData = new book(data)
        await newData.save()
        console.log("this Data is from backend", newData)
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.CREATED, result: newData })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }

})

// This is the Book Get API
const getAllBook = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        let result;
        if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(currentUser.role?.name) || currentUser?.isSuperAdmin) {
            result = await book.find({}).sort({ createdAt: -1 });
        } else {
            result = await book.find({ auther: currentUser._id }).sort({ createdAt: -1 });
        }
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        console.log("kjhkjdhfskj", err)
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
        if (!status || status == "") {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELD })
        }
        if (!(status == "approved" || status == "rejected")) return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.REQUEST })

        const result = await book.findById(bookId)

        if (!result) return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
        if (!result.status == "pending") return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.ALREADY.ALREADY_UPDATED })

        result.status = status;
        await result.save();
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE })
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
        const FindOne = await book.findById(bookId);
        if (!FindOne) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
        }
        if (data.status) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.UNAUTHORIZED.UNAUTHORIZE })
        }
        if (data.isImgDel == "true") {
            data.image = {};
        } else {
            if (req?.files?.cover) {
                data.image = await uploadFile(req?.files?.cover[0], data?.image?.url || null);
            }
            if (req?.files?.file) {
                data.file = await uploadFile(req?.files?.file[0], null);
            }
        }
        data.status = "pending";
        const result = await book.findByIdAndUpdate(bookId, data, { new: true });
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Book Delete API
const deleteBookById = catchAsync(async (req, res) => {
    const currentUser = req.user
    const bookId = req.params.id
    console.log("))))))))))))))))))))", currentUser);
    try {
        const FindOne = await book.findById(bookId);
        if (!FindOne) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
        }
        let result;
        if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(currentUser.role?.name) || currentUser?.isSuperAdmin == true) {
            result = await book.findByIdAndDelete(bookId);
        } else {
            result = await book.findOneAndDelete({ _id: bookId, auther: currentUser._id });

        }
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE, result: result?._id })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

module.exports = { addBook, getAllBook, getPublicBook, getBookById, reviewBook, updateBookById, deleteBookById };