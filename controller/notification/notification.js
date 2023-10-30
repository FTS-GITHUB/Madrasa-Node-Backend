const express = require("express");

// Models :
const NotificationModel = require("../../model/notifications");

// Helpers :
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index");





const getAllNotifications = catchAsync(async (req, res, next) => {

    let CurrentUser = req.user;
    try {
        const result = await NotificationModel.find({ to: { $in: [CurrentUser?._id] } }).populate("to").sort({ createdAt: -1 })
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const readNotification = catchAsync(async (req, res, next) => {
    let CurrentUser = req.user;
    try {
        let { notificationId } = req.body;
        const result = await NotificationModel.findByIdAndUpdate(notificationId, { $set: { read: true } }, { new: true })
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


module.exports = { getAllNotifications, readNotification };