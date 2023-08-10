const contact = require("../../model/contact");
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index");
const SendEmail = require("../../utils/emails/sendEmail");


// This is the Contact Add API
const addContact = catchAsync(async (req, res) => {
    const data = req.body
    let email = "it.4firmtechservices@gmail.com"
    try {
        const newData = new contact(data)
        await newData.save()
        await SendEmail(
            {
              email : data.email,
              subject: "Contact From Madrasa.io",
              code: "This is the Code Contact From Madrasa.io",
            //   code: `First Name : ${data?.firstName} \n Last Name : ${data?.lastName} \n Email : ${data?.email} \n Subject : ${data?.subject} \n Message : ${data?.message} \n`,
            },
            next
          );
      
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result: newData })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})
module.exports = { addContact };