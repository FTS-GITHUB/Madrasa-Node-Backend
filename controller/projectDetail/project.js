const STATUS_CODE = require("../../constants/statusCode");
const project = require("../../model/project");
const catchAsync = require("../../utils/catchAsync");





exports.projectGet = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        const result = await project.find({ [currentUser.role]: currentUser._id }).populate("client contractor engineer");
        res.status(STATUS_CODE.OK).json({ result, message: "Data Fatched Success Fully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

exports.projectPost = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body

    data.client = currentUser?._id

    try {
        const newData = new project(data)
        await newData.save()
        console.log("Store Data SucccessFully")
        res.status(STATUS_CODE.OK).json({ message: `Project Detail Inserted SuccessFully`, result: newData, statusCode: STATUS_CODE.CREATED })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }

})

