const booking = require("../../model/booking");
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index")


// This is the Booking Post API
const addBooking = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body
    data.user = currentUser?._id

    try {
        const newData = new booking(data)
        await newData.save()
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.CREATED, result: newData})
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Booking Get API
const getAllBooking = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        const result = await booking.find({ [currentUser.role]: currentUser._id })
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS ,result})
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the booking Get One Data API
const getBookingById = catchAsync(async (req, res) => {
    let bookingId = req.params.id
    try {
        const result = await booking.findById(bookingId );
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result})
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


// This is the Booking Patch API
const updateBookingById = catchAsync(async (req, res) => {
    const updateData = req.body
    const bookingId = req.params.id;
    try {
        const result = await booking.findByIdAndUpdate(bookingId , { $set: updateData });
        res.status(STATUS_CODE.OK).json({message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE,result})
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Booking Delete API
const deleteBookingById = catchAsync(async (req, res) => {
    const bookingId = req.params.id
    try {

         let result = await booking.findOneAndDelete({ _id: bookingId, auther: currentUser._id });
        if (result) {
            return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE })
        }
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

module.exports = {addBooking, getAllBooking, getBookingById, updateBookingById , deleteBookingById};