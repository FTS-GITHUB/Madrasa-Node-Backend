const ScheduleModel = require("../../model/ScheduleModel");
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index")


// This is the Schedule Post API
const addSchedule = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body
    data.user = currentUser?._id

    try {
        // console.log(req.body)
        if (!data.title || data.title == "" || !data.detail || data.detail == "") {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELD })
        }
        if (req?.files?.cover) {
            data.image = await uploadFile(req?.files?.cover[0], data?.image?.url || null);
        }
        if (req?.files?.file) {
            data.file = await uploadFile(req?.files?.file[0], null);
        }
        const newData = new ScheduleModel(data)
        await newData.save()
        console.log("this Data is from backend", newData)
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.CREATED, result: newData })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }

})


// This is the get All Public Books Which is Approve Data API
const getPublicSchedule = catchAsync(async (req, res) => {
    try {
        const result = await ScheduleModel.find({ status: "approved" })
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


module.exports = { addSchedule, getPublicSchedule };