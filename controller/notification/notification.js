const express = require("express");

// Models :
const NotificationModel = require("../../model/notifications");

// Helpers :
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index");





const getAllNotifications = catchAsync(async (req, res, next) => {

    let CurrentUser = req.user;
    try {
        const result = NotificationModel.find({ to: { $in: [CurrentUser?._id] } })
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


module.exports = { getAllNotifications };