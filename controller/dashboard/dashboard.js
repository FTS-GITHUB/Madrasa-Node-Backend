const contact = require("../../model/contact");
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index");
const UserModel = require("../../model/user");
const MeetingModel = require("../../model/meeting");
const BookModel = require("../../model/book");
const BlogModel = require("../../model/blogs");
const SubModel = require("../../model/subscription");


// This is the Contact Add API
const dashboardStatics = catchAsync(async (req, res, next) => {
    try {

        const allUsers = await UserModel.find();
        const allMeetings = await MeetingModel.find();
        const allBooks = await BookModel.find();
        const allBlogs = await BlogModel.find();
        const allSubs = await SubModel.find();

        let result = {
            users: {
                total: 0,
                registered: 0,
                students: 0,
                teachers: 0,
                pending: 0,
            },
            meetings: {
                total: 0,
                pending: 0,
                completed: 0
            },
            books: {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0
            },
            blogs: {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0
            },
            subscription: {
                total: 0
            }
        }

        allUsers.map(user => {
            if (user.role?.name == "student" && user.status == "approved") {
                result.users.students += 1
            }
            if (user.role?.name == "teacher" && user.status == "approved") {
                result.users.teachers += 1
            }
            if (user.status == "created" || user.status == "pending") {
                result.users.pending += 1
            }
            if (user.status == "approved" || user.status == "banned") {
                result.users.registered += 1
            }
        })
        allMeetings.map(meet => {
            if (meet?.status == "pending") {
                result.meetings.pending += 1
            }
            if (meet?.status == "completed") {
                result.meetings.completed += 1
            }
        })
        allBooks.map(book => {
            if (book?.status == "pending") {
                result.books.pending += 1
            }
            if (book?.status == "approved") {
                result.books.approved += 1
            }
            if (book?.status == "rejected") {
                result.books.rejected += 1
            }
        })
        allBlogs.map(blog => {
            if (blog?.status == "pending") {
                result.blogs.pending += 1
            }
            if (blog?.status == "approved") {
                result.blogs.approved += 1
            }
            if (blog?.status == "rejected") {
                result.blogs.rejected += 1
            }
        })

        result.users.total = allUsers.length;
        result.meetings.total = allMeetings.length;
        result.books.total = allBooks.length;
        result.blogs.total = allBlogs.length;
        result.subscription.total = allSubs.length;

        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})
module.exports = { dashboardStatics };