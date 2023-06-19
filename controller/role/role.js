const express = require("express");

const RolesModel = require("../../model/role");

const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index")





const getAllRoles = catchAsync(async (req, res, next) => {
    try {
        const result = await RolesModel.find();

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR })
    }
})

const createRole = catchAsync(async (req, res, next) => {
    try {
        const result = new RolesModel(req.body);
        await result.save();
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR })
    }
})




module.exports = { getAllRoles, createRole };