const express = require("express");

const RolesModel = require("../../model/role");

const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index")





const getAllRoles = catchAsync(async (req, res, next) => {
    try {
        const result = await RolesModel.find();

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const createRole = catchAsync(async (req, res, next) => {
    try {
        const result = new RolesModel(req.body);
        await result.save();
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        next(err)
        // res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const updateRole = catchAsync(async (req, res, next) => {
    try {
        let { id } = req.params;
        if (!id) {

        }
        const result = await RolesModel.findByIdAndUpdate(id, req.body, { new: true })
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const deleteRole = catchAsync(async (req, res, next) => {
    try {
        let { id } = req.params;
        if (!id) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: ["id"] })
        }
        const findRole = await RolesModel.findById(id)
        if (!findRole) {
            return res.status(STATUS_CODE.NOT_FOUND).json({ message: ERRORS.INVALID.NOT_FOUND })
        }
        if (findRole.notDeleteAble) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Primary Role , Not DeleteAble" })
        }
        const result = await RolesModel.findByIdAndDelete(id)
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})




module.exports = { getAllRoles, createRole, updateRole, deleteRole };