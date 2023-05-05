const STATUS_CODE = require("../../constants/statusCode");
const transaction = require("../../model/transaction");
const catchAsync = require("../../utils/catchAsync");


// This is the Transaction Post API
exports.transactionPost = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body

    data.sender = currentUser?._id

    try {
        const newData = new transaction(data)
        await newData.save()
        console.log("Store Data SucccessFully")
        res.status(STATUS_CODE.OK).json({ message: `Transaction Detail Inserted SuccessFully`, result: newData, statusCode: STATUS_CODE.CREATED })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }

})

// This is the Transaction Get API
exports.transactionGet = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        const result = await transaction.find({ [currentUser.role]: currentUser._id });
        res.status(STATUS_CODE.OK).json({ result, message: "Data Fatched SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Transaction Get One API
exports.transactionGet = catchAsync(async (req, res) => {
    let transactionId = req.params.id
    try {
        let currentUser = req.user;
        const result = await transaction.findOne({ [currentUser.role]: currentUser._id, _id: transactionId });
        res.status(STATUS_CODE.OK).json({ result, message: "Data Fatched SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Transaction Patch API
exports.transactionPatch = catchAsync(async (req, res) => {
    const updateData = req.body
    const transactionId = req.params.id;
    try {
        // let currentUser = req.user;
        const result = await transaction.findOneAndUpdate({ _id: transactionId }, { $set: updateData });
        res.status(STATUS_CODE.OK).json({ result, message: "Data Updated SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Transaction Delete API
exports.transactionDelete = catchAsync(async (req, res) => {
    const transactionId = req.params.id
    try {
        let currentUser = req.user;
        // const result = await transaction.findOneAndDelete({ [currentUser.role]: currentUser._id ,_id:transactionId});
        const result = await transaction.findOneAndDelete({ _id: transactionId });
        res.status(STATUS_CODE.OK).json({ result, message: "Transaction Data is deleted SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})