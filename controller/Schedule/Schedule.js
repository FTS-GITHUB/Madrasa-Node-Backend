const ScheduleModel = require("../../model/schedule");
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index")


// This is the Schedule Post API -- if user not schedule then new schedule created other wise schedule updated
const addSchedule = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = { teacher: currentUser?._id, Availibility: req.body }
    try {
        const findUser = await ScheduleModel.findOne({teacher: currentUser?._id })
        if (findUser) {
            const result = await ScheduleModel.findOneAndUpdate({ teacher: currentUser?._id } ,data , {new: true})
            return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
        }
        else{
            const newData = new ScheduleModel(data)
            await newData.save()
            return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.CREATED, result: newData })
        }
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


// This is the get API for indivisule teacher Schedule
const TeacherSchedule = catchAsync(async (req, res) => {
    const userData = req.user;
    try {
        const result = await ScheduleModel.findOne({teacher: userData?._id })
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


// This is the get All Public Schedule APi
const getPublicSchedule = catchAsync(async (req, res) => {
    try {
        const result = await ScheduleModel.find({})
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


module.exports = { addSchedule, getPublicSchedule, TeacherSchedule };