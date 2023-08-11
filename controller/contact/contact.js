const contact = require("../../model/contact");
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index");


// This is the Contact Add API
const addContact = catchAsync(async (req, res, next) => {
    const data = req.body
    try {
        const newData = new contact(data)
        await newData.save()
      
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result: newData })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})
module.exports = { addContact };