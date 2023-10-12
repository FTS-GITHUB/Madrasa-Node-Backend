const express = require('express');

// Model : 
const commissionModel = require('../../model/commission');

// Helpers :
const catchAsync = require('../../utils/catchAsync')
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index");
const { ERROR } = require('../../constants/status');



// Add Commission API
const setCommission = catchAsync(async (req, res) => {

    let commissionData = req.body;

    try {
        if (commissionData?.bookCommission < 0 || commissionData?.bookCommission > 100 || commissionData?.meetingCommission < 0 || commissionData?.meetingCommission > 100) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Commission must be 0 to 100" })
        }
        const result = new commissionModel(commissionData)
        await result.save()
        return res.status(STATUS_CODE.CREATED).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })

    } catch (err) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


// Get All Commission API
const getCommission = catchAsync(async (req, res) => {
    try {
        let result = await commissionModel.find({})
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})



// Update Commission API
const updateCommission = catchAsync(async (req, res) => {
    let commissionData = req.body
    let commissionId = req.params.id;
    try {
        let result = await commissionModel.findOneAndUpdate({ _id: commissionId }, commissionData, { new: true })
        console.log("this is the result", result)
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (error) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, error })
    }
})


const deleteCommission = catchAsync(async (req, res) => {
    try {
        let result = await commissionModel.findOneAndDelete(req.params.id)
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS })
    } catch (error) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR.error })
    }
})



module.exports = { setCommission, getCommission, updateCommission, deleteCommission }