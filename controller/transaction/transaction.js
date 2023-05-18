const transaction = require("../../model/transaction");
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index")


// This is the Transaction Post API
const addTransaction = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body;

    data.sender = currentUser?._id;

    try {
        if (!data.sender || data.sender == "" || !data.receiver || data.receiver == "", !data.source || data.source == "" || !data.orderPrice || data.orderPrice == "" || !data.transactionType || data.transactionType == "" || !data.balance || data.balance == "" || !data.charges || data.charges=="" || !data.orderType || data.orderType == "") {
            return res.status(STATUS_CODE.ALREADY).json({ message: ERRORS.REQUIRED.FIELD })
        }
        const newData = new transaction(data)
        await newData.save()
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.CREATED, result: newData })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }

})

// This is the Transaction Get API
const getAllTransaction = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        let result;
        if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(currentUser.role)) {
            result = await transaction.find({});
        } else {
            result = await transaction.find({ auther: currentUser._id });
        }
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.BAD_REQUEST, err })
    }
})

// This is the Transaction Get One API
const getTransactionById = catchAsync(async (req, res) => {
    let transactionId = req.params.id

    try {
        const FindOne = await transaction.findById(transactionId)
        if (!FindOne) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
        }
        const result = await transaction.findById(transactionId);
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is update Review Transaction API
const reviewTransaction = catchAsync(async (req, res) => {
    const { transactionId, status } = req.body;
    try {
        if (!status || status == "") {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELD })
        }
        const FindOne = await transaction.findOne({ _id: transactionId, status: "pending" })
        if (FindOne) {
            if (FindOne.status == "approved" || FindOne.status == "rejected") {
                res.status(STATUS_CODE.BAD_REQUEST).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.ALREADY })
            } else {
                const result = await transaction.findOneAndUpdate({ _id: transactionId }, { $set: { status: status } }, { new: true })
                return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE, result })
            }
        } else {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.ALREADY })
        }
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Transaction Patch API
const updateTransactionById = catchAsync(async (req, res) => {
    const updateData = req.body
    const transactionId = req.params.id;
    try {
        const FindOne = await transaction.findById(transactionId)
        if (!FindOne) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
        }
        updateData.status = "pending"
        const result = await transaction.findByIdAndUpdate(transactionId, { $set: updateData }, { new: true });
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Transaction Delete API
const deleteTransactionById = catchAsync(async (req, res) => {
    const currentUser = req.user
    const transactionId = req.params.id
    try {
        const FindOne = await transaction.findById(transactionId)
        if (!FindOne) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
        }
        let result;
        if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(currentUser.role)) {
            result = await transaction.findByIdAndDelete(transactionId);
        } else {
            result = await transaction.findOneAndDelete({ _id: transactionId, auther: currentUser._id });
        }
        if (result) {
            return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE })
        }
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


module.exports = { addTransaction, getAllTransaction, getTransactionById, reviewTransaction, updateTransactionById, deleteTransactionById };