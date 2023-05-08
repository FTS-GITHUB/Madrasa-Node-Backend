const STATUS_CODE = require("../../constants/statusCode");
const transaction = require("../../model/transaction");
const catchAsync = require("../../utils/catchAsync");


// This is the Transaction Post API
exports.addTransaction = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const receiverUser = req.user;
    const source = req.book;
    const data = req.body;

    data.sender = currentUser?._id;
    data.receiver = receiverUser?._id;
    data.source = source?._id;


    try {
        const newData = new transaction(data)
        await newData.save()
        res.status(STATUS_CODE.OK).json({ message: `Transaction Detail Inserted SuccessFully`, result: newData })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }

})

// This is the Transaction Get API
exports.getAllTransaction = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        const result = await transaction.find({ [currentUser.role]: currentUser._id });
        res.status(STATUS_CODE.OK).json({ result:result, message: "Data Fatched SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Transaction Get One API
exports.getTransactionById = catchAsync(async (req, res) => {
    let transactionId = req.params.id
    try {
        const result = await transaction.findById(transactionId );
        res.status(STATUS_CODE.OK).json({ result:result, message: "Data Fatched SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Transaction Patch API
exports.updateTransactionById = catchAsync(async (req, res) => {
    const updateData = req.body
    const transactionId = req.params.id;
    try {
        const result = await transaction.findByIdAndUpdate(transactionId , { $set: updateData });
        res.status(STATUS_CODE.OK).json({ result:result, message: "Data Updated SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Transaction Delete API
exports.deleteTransactionById = catchAsync(async (req, res) => {
    const transactionId = req.params.id
    try {
        const result = await transaction.findByIdAndDelete(transactionId );
        res.status(STATUS_CODE.OK).json({ result:result, message: "Transaction Data is deleted SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})