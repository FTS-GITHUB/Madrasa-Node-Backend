const contact = require("../../model/contact");
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index");
const UserModel = require("../../model/user");
const MeetingModel = require("../../model/meeting");


// This is the Contact Add API
const dashboardStatics = catchAsync(async (req, res, next) => {
    try {

        const allUsers = await UserModel.find();
        const allMeetings = await MeetingModel.find()

        let result = {
            registered: 0,
            students: 0,
            teachers: 0,
            pending: 0,
            meetings: 0
        }

        allUsers.map(user => {
            if (user.role?.name == "student" && user.status == "approved") {
                result.students += 1
            }
            if (user.role?.name == "teacher" && user.status == "approved") {
                result.teachers += 1
            }
            if (user.status == "created" || user.status == "pending") {
                result.pending += 1
            }
            if (user.status == "approved" || user.status == "banned") {
                result.registered += 1
            }
        })

        result.meetings = allMeetings.length;

        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})
module.exports = { dashboardStatics };