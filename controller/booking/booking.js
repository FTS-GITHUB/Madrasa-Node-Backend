const BookingModel = require("../../model/booking");
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index")
const BookModel = require("../../model/book");
const UserModel = require("../../model/user");




// This is the Booking Get API
const getAllBooking = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        const result = await BookingModel.find({ [currentUser.role]: currentUser._id })
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})
// This is the Booking Get One Data API
const getBookingById = catchAsync(async (req, res) => {
    let bookingId = req.params.id
    try {
        const result = await BookingModel.findById(bookingId);
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


// Create Booking
const addBooking = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body
    data.user = currentUser?._id

    try {
        const newData = new BookingModel(data)
        await newData.save()
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.CREATED, result: newData })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})
// Pay Booking Amount
const payBooking = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body
    data.user = currentUser?._id

    try {
        const newData = new BookingModel(data)
        await newData.save()
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.CREATED, result: newData })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})



// Get All Purchased Books :
const getAllPaidBookings = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;

        const result = await BookingModel.aggregate([
            {
                $match: { /* Your match conditions, if any */ }
            },
            {
                $unwind: "$details"
            },
            {
                $unwind: "$details.sources"
            },
            {
                $lookup: {
                    from: BookModel.collection.name,
                    localField: "details.sources.bookData",
                    foreignField: "_id",
                    as: "bookData"
                }
            },
            {
                $unwind: "$bookData"
            },
            {
                $lookup: {
                    from: UserModel.collection.name,
                    localField: "bookData.auther",
                    foreignField: "_id",
                    as: "bookData.auther"
                }
            },
            {
                $unwind: "$bookData.auther"
            },
            {
                $group: {
                    _id: {
                        buyer: "$buyer",
                        detailsId: "$details._id"
                    },
                    sourcesData: {
                        $push: {
                            bookData: "$bookData",
                            review: "$details.sources.review"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id.buyer",
                    bookings: {
                        $push: {
                            detailsId: "$_id.detailsId",
                            sourcesData: "$sourcesData"
                        }
                    }
                }
            }
        ]);
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})
// Review Booking
const reviewBooking = catchAsync(async (req, res) => {
    const currentUser = req.user;
    let { id, review } = req.body;

    try {
        const result = await BookingModel.findByIdAndUpdate(bookingId, { $set: updateData });
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Booking Delete API
const deleteBookingById = catchAsync(async (req, res) => {
    const bookingId = req.params.id
    try {

        let result = await BookingModel.findOneAndDelete({ _id: bookingId, auther: currentUser._id });
        if (result) {
            return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE })
        }
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

module.exports = { getAllBooking, getBookingById, addBooking, getAllPaidBookings, reviewBooking, deleteBookingById };