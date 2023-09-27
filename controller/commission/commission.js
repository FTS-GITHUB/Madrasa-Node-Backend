const express = require('express');

// Model : 
const commissionModel = require('../../model/commission');

// Helpers :
const catchAsync = require('../../utils/catchAsync')
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index");




const setCommission = catchAsync(async (req, res) => {

    let commissionData = req.body;
    let commissionId = req.params.id;

    try {
        if (commissionData?.bookCommission < 0 || commissionData?.bookCommission > 100 || commissionData?.meetingCommission < 0 || commissionData?.meetingCommission > 100) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Commission must be 0 to 100" })
        }
        let chkcommission = await commissionModel.find({})
        if (chkcommission.length >= 1) {
            let result = await commissionModel.findOneAndUpdate(commissionId, commissionData, { new: true })
            return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
        } else {
            const result = new commissionModel(commissionData)
            await result.save()
            return res.status(STATUS_CODE.CREATED).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
        }
    } catch (err) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const getCommission = catchAsync(async (req, res) => {
    try {
        let result = await commissionModel.find({})
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


module.exports = { setCommission, getCommission }