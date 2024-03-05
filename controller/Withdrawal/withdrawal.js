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
    // return res.status(STATUS_CODE.BAD_REQUEST).json({data})

    data.UserData = currentUser?._id

    try{
        // if (!data.bank_name || data.bank_name == "" || !data.branch_name || data.branch_name == "" || !req.branch_code || req.branch_code == "" || !data.iban || data.iban == "" || !req.account_number || req.account_number == "" || !data.amount || data.amount == "" || !req.currency || req.currency == "") {
        //     return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING,})
        // }
        let { stripId } = currentUser;

        

        if (!stripId) return res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.STRIP_ERROR })

        const result = await STRIPE.customers.retrieve(stripId)
        // res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
        if(result.balance < data.amount ){
            return res.status(STATUS_CODE.SERVER_ERROR).json({ message: "You Dont Have Enough Amount In Your Account!"})
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
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
        // res.status(STATUS_CODE.UNAUTHORIZED).json({ message: ERRORS.UNAUTHORIZED.UNABLE})
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

module.exports = {addRequest, getAllWithdrawals}