const STATUS_CODE = require("../../constants/statusCode");
const booking = require("../../model/booking");
const catchAsync = require("../../utils/catchAsync");


// This is the Booking Post API
exports.bookingPost = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body

    data.user = currentUser?._id

    try {
        const newData = new booking(data)
        await newData.save()
        console.log("Store Data SucccessFully")
        res.status(STATUS_CODE.OK).json({ message: `booking Detail Inserted SuccessFully`, result: newData, statusCode: STATUS_CODE.CREATED })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }

})

// This is the Booking Get API
exports.bookingGet = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        const result = await booking.find({ [currentUser.role]: currentUser._id })
        res.status(STATUS_CODE.OK).json({ result, message: "Data Fatched SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Booking Patch API
exports.bookingPatch = catchAsync(async (req, res) => {
    const updateData = req.body
    const bookingId = req.params.id;
    try {
        let currentUser = req.user;
        const result = await booking.findOneAndUpdate({ [currentUser.role]: currentUser._id, _id: bookingId }, { $set: updateData });
        res.status(STATUS_CODE.OK).json({ result, message: "Data Updated SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Booking Delete API
exports.bookingDelete = catchAsync(async (req, res) => {
    const bookingId = req.params.id
    try {
        let currentUser = req.user;
        const result = await booking.findOneAndDelete({ [currentUser.role]: currentUser._id, _id: bookingId });
        res.status(STATUS_CODE.OK).json({ result, message: "Data Delete SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})