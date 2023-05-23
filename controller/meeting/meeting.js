const express = require("express");

// Models :
const MeetingModel = require("../../model/meeting");

// Helpers :
const catchAsync = require("../../utils/catchAsync");
const { STATUS_CODE, SUCCESS_MSG, ERRORS } = require("../../constants");
const MeetingURLGen = require("../../utils/zoomLinkgenrator")





const getAllMeetings = catchAsync(async (req, res, next) => {
    let currentuser = req.user;
    try {
        const result = await MeetingModel.find({ admin: currentuser?._id })
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const getMeetingLinkWithShortLink = catchAsync(async (req, res, next) => {
    let { shortLink } = req.params;
    try {
        const meetingData = await MeetingModel.findOne({ shortLink })
        if (!meetingData) {
            res.status(STATUS_CODE.NOT_FOUND).json({ message: ERRORS.INVALID.NOT_FOUND })
            return
        }
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result: { url: meetingData?.link } })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const createMeetinglink = catchAsync(async (req, res, next) => {
    let currentuser = req.user;
    try {
        const MeetingURL = await MeetingURLGen({ title: "My Title" }, next)

        let data = {
            ...req.body,
            ...MeetingURL,
            admin: currentuser?._id,
        }

        const MeetingData = new MeetingModel(data)
        let shortLinkRes = await MeetingData.createShortLink()
        await MeetingData.save()

        res.status(STATUS_CODE.CREATED).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result: MeetingData })

    } catch (err) {
        console.log("&&&&&&&&&&", err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

module.exports = { getAllMeetings, createMeetinglink , getMeetingLinkWithShortLink }