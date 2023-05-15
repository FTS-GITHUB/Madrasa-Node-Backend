const transaction = require("../../model/transaction");
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG , ERRORS , STATUS_CODE, ROLES } = require("../../constants/index")


// This is the Transaction Post API
const addTransaction = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const receiverUser = req.body.receiver;
    const source = req.body.book;
    const data = req.body;

    data.sender = currentUser?._id;
    data.receiver = receiverUser?._id;
    data.source = source?._id;

    try {
        if(!data.sender || data.sender=="" || !data.receiver|| data.receiver=="", !data.source || data.source=="", !data){
            res.status(STATUS_CODE.ALREADY).json({ message: ERRORS.REQUIRED.FIELD })
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
        res.status(STATUS_CODE.OK).json({ message:SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS , result})
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Transaction Get One API
const getTransactionById = catchAsync(async (req, res) => {
    let transactionId = req.params.id
    try {
        const result = await transaction.findById(transactionId );
        res.status(STATUS_CODE.OK).json({  message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result})
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Transaction Patch API
const updateTransactionById = catchAsync(async (req, res) => {
    const updateData = req.body
    const transactionId = req.params.id;
    try {
        const result = await transaction.findByIdAndUpdate(transactionId , { $set: updateData });
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE , result})
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({message:SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, err })
    }
})

// This is the Transaction Delete API
const deleteTransactionById = catchAsync(async (req, res) => {
    const transactionId = req.params.id
    try {
        const result = await transaction.findByIdAndDelete(transactionId );
        res.status(STATUS_CODE.OK).json({message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message:SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, err })
    }
})


module.exports = {addTransaction, getAllTransaction, getTransactionById, updateTransactionById , deleteTransactionById};