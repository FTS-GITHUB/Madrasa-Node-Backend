const contact = require("../../model/contact");
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index");
const SendEmail = require("../../utils/emails/sendEmail")


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
// This is the Contact Add API
const allContact = catchAsync(async (req, res, next) => {
    try {
        const result = await contact.find().sort({ createdAt: -1 });

        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const replyContact = catchAsync(async (req, res, next) => {
    try {
        let { contactId, message } = req.body;

        if (!contactId || !message) return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: ["contactId", "message"] });

        const isExist = await contact.findById(contactId);
        if (!isExist) return res.status(STATUS_CODE.NOT_FOUND).json({ message: "Contact not Found" });

        await SendEmail(
            {
                email: isExist.email,
                subject: "Query Response",
                code: message,
            },
            next
        );

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL });
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
    }
});

module.exports = { addContact, allContact, replyContact };