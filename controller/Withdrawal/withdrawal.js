const express = require("express");
const withdrawalModel = require("../../model/withdrawal");
const catchAsync = require("../../utils/catchAsync");
const { uploadFile } = require("../../utils/uploader");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index")

// STRIPE :
const { STRIPE, TransaferAmountToCustomer } = require("../../utils/Stripe")

// This is the Blog Post API
const addRequest = catchAsync(async (req, res) => {
    
    const currentUser = req.user;
    const data = req.body
    // console.log(data);
    // return res.status(STATUS_CODE.OK).json({data})

    data.UserData = currentUser?._id

    try{
        // if (!data.bank_name || data.bank_name == "" || !data.branch_name || data.branch_name == "" || !req.branch_code || req.branch_code == "" || !data.iban || data.iban == "" || !req.account_number || req.account_number == "" || !data.amount || data.amount == "" || !req.currency || req.currency == "") {
        //     return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING,})
        // }
        let { stripId } = currentUser;

        

        if (!stripId) return res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.STRIP_ERROR })

        const result = await STRIPE.customers.retrieve(stripId)
        // res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
        if(!currentUser)  res.status(STATUS_CODE.UNAUTHORIZED).json({ message: ERRORS.UNAUTHORIZED.UNABLE})
        const totalWithdrawal = await withdrawalModel.aggregate([
            { $match: { UserData: currentUser._id, status: "pending" } }, // Filter withdrawals for the current user
            { $group: { _id: null, total: { $sum: "$amount" } } } // Calculate the sum of the amount field
        ]);
        // res.json({ totalWithdrawal});
            // Extract the total sum from the result (if any)
        const sumOfAmounts = totalWithdrawal.length > 0 ? totalWithdrawal[0].total : 0;
        if(result.balance < data.amount || result.balance < sumOfAmounts ){
            return res.status(STATUS_CODE.SERVER_ERROR).json({ message: "Invalid Amount"})
        }
        else{
            const newData = new withdrawalModel(data)
            await newData.save()
            return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.CREATED, result: newData })
        }
    }
    catch(err) {
        return res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const getAllWithdrawals = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        let result;
        if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(currentUser.role?.name) || currentUser?.isSuperAdmin) {
            result = await withdrawalModel.find({ }).populate("UserData");
        }
        else {
            result = await withdrawalModel.find({ UserData: currentUser?._id }).populate("UserData");
        }
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
        // res.status(STATUS_CODE.UNAUTHORIZED).json({ message: ERRORS.UNAUTHORIZED.UNABLE})
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})
const totalwithdrawl = catchAsync(async (req, res) => {
    try{
        let currentUser = req.user;

        if(!currentUser?.isSuperAdmin){
        let { stripId } = currentUser;
        if (!stripId) return res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.STRIP_ERROR })

        if(!currentUser)  res.status(STATUS_CODE.UNAUTHORIZED).json({ message: ERRORS.UNAUTHORIZED.UNABLE})
        const totalWithdrawal = await withdrawalModel.aggregate([
            { $match: { UserData: currentUser._id, status: "paid" } }, // Filter withdrawals for the current user
            { $group: { _id: null, total: { $sum: "$amount" } } } // Calculate the sum of the amount field
        ]);
        
    const sumOfAmounts = totalWithdrawal.length > 0 ? totalWithdrawal[0].total : 0;

    const pendingtotalWithdrawal = await withdrawalModel.aggregate([
        { $match: { UserData: currentUser._id, status: "pending" } }, // Filter withdrawals for the current user
        { $group: { _id: null, total: { $sum: "$amount" } } } // Calculate the sum of the amount field
    ]);
    
    const pendingsumOfAmounts = pendingtotalWithdrawal.length > 0 ? pendingtotalWithdrawal[0].total : 0;

    const balance = await STRIPE.customers.retrieve(stripId)
    
    res.status(STATUS_CODE.OK).json({ sumOfAmounts , balance, pendingsumOfAmounts });
    }


    // Send the sum as a response
   
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})
// const updateWithdrawal = catchAsync(async (req, res ) => {
//     const currentUser = req.user;
//     const data = req.body;
//     const BlogId = req.params.id;
//     try {
//         return res.status(STATUS.OK).json({ data });
//     } catch (err) {
//         res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
//     }
// })

const updateWithdrawal = catchAsync(async (req, res) => {

    const currentUser = req.user;
    const data = req.body;
    const withdrawalId = req.params.id;
    try {
        // res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, data })
        const FindOne = await withdrawalModel.findById(withdrawalId)
        if (!FindOne) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
        }
        if (data.isImgDel == "true") {
            data.image = {};
        } else {
            if (req.file) {
                data.image = await uploadFile(req.file, data?.image?.url || null);
            }
        }
        const result = await withdrawalModel.findByIdAndUpdate(withdrawalId, data, { new: true });
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE, result: result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


module.exports = {addRequest, getAllWithdrawals, totalwithdrawl, updateWithdrawal}