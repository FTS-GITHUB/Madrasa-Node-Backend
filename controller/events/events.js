const express = require("express");

const EventModel = require("../../model/events");

const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index")





// This is the Blog Post API
const addEvent = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body

    data.auther = currentUser?._id

    try {
        if (!data.title || data.title == "" || !data.description || data.description == "") {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELD })
        }
        const newData = new EventModel(data)
        await newData.save()
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.CREATED, result: newData })
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }

})

// This is the Blog Get API
const getAllEvents = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        let result;
        if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(currentUser.role?.name) || currentUser?.isSuperAdmin) {
            result = await EventModel.find();
        } else {
            result = await EventModel.find({ auther: currentUser._id });
        }
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result: result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the get All Public Blog Which is Approve Data API
const getPublicEvents = catchAsync(async (req, res) => {
    try {
        const result = await EventModel.find()
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Blog Get One Data API
const getEventById = catchAsync(async (req, res) => {
    let eventId = req.params.id
    try {
        const result = await EventModel.findById(eventId);
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


// This is the Blog Patch API
const updateEventById = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body;
    const eventId = req.params.id;
    try {
        const FindOne = await EventModel.findById(eventId)
        if (!FindOne) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
        }
       
        const result = await EventModel.findByIdAndUpdate(eventId, data, { new: true });
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE, result: result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Blog Delete API
const deleteEventById = catchAsync(async (req, res) => {
    const eventId = req.params.id
    const currentUser = req.user
    try {
        const FindOne = await EventModel.findById(eventId)
        if (!FindOne) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
        }
        let result;
        if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(currentUser.role)) {
            result = await EventModel.findByIdAndDelete(eventId);
        } else {
            result = await EventModel.findOneAndDelete({ _id: eventId, auther: currentUser._id });
        }
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

module.exports = { addEvent, getAllEvents, getPublicEvents, getEventById, updateEventById, deleteEventById };