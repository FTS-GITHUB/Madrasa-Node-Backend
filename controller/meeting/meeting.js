const express = require("express");

// Models :
const MeetingModel = require("../../model/meeting");
const UserModel = require("../../model/user");
const BookingModel = require("../../model/booking")
const TransactionModel = require("../../model/transaction")
const CommissionModel = require("../../model/commission");
const NotificationModel = require("../../model/notifications");
// Mongoose :
const mongoose = require("mongoose")

// STRIPE :
const { STRIPE } = require("../../utils/Stripe")
// Helpers :
const catchAsync = require("../../utils/catchAsync");
const { STATUS_CODE, SUCCESS_MSG, ERRORS, ROLES } = require("../../constants");
const MeetingURLGen = require("../../utils/zoomLinkgenrator");
const SendEmail = require("../../utils/emails/sendEmail");



const getAllMeetings = catchAsync(async (req, res, next) => {
    let currentuser = req.user;
    try {
        const result = await MeetingModel.find({ admin: currentuser?._id })
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const getMeetingByID = catchAsync(async (req, res, next) => {
    let currentuser = req.user;
    let id = req.params?.id
    try {
        const result = await MeetingModel.findById(id)
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const getMeetingLinkWithShortLink = catchAsync(async (req, res, next) => {
    let { shortLink } = req.params;
    try {
        const meetingData = await MeetingModel.findOne({ shortLink })
        if (!meetingData) {
            res.status(STATUS_CODE.NOT_FOUND).json({ message: ERRORS.INVALID.NOT_FOUND })
            return
        }
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result: { url: meetingData?.link } })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const createMeetinglink = catchAsync(async (req, res, next) => {
    let currentuser = req.user;
    try {
        const MeetingURL = await MeetingURLGen({ title: "My Title" }, next)

        let data = {
            ...req.body,
            ...MeetingURL,
            admin: currentuser?._id,
        }

        const MeetingData = new MeetingModel(data)
        let shortLinkRes = await MeetingData.createShortLink()
        await MeetingData.save()

        res.status(STATUS_CODE.CREATED).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result: MeetingData })

    } catch (err) {
        console.log("&&&&&&&&&&", err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


const getAllPaidMeetings = catchAsync(async (req, res, next) => {
    let currentuser = req.user;
    try {
        let result;
        if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(currentuser?.role?.name) || currentuser?.isSuperAdmin) {
            result = await MeetingModel.find({})
        }
        else if ([ROLES.TEACHER].includes(currentuser?.role?.name)) {
            result = await MeetingModel.find({ admin: currentuser?._id })
        }
        else if ([ROLES.STUDENT].includes(currentuser?.role?.name)) {
            result = await MeetingModel.find({ participants: { $in: [currentuser?._id] } })
        }
        else {
            result = []
        }
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const createPaidMeetinglink = catchAsync(async (req, res, next) => {
    const currentUser = req.user
    try {

        let { teacherID, cardDetails, startDate, thoughts } = req.body;
        let { cardNumber, expMonth, expYear, cvc } = cardDetails;

        // if (!cardNumber || !expMonth || !expYear || !cvc) {
        //     return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: ["cardNumber", "expMonth", "expYear", "cvc"] })
        // }

        const TeacherData = await UserModel.findById(teacherID);
        if (!TeacherData) return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND, error: "Teacher Not Found" })
        if (!TeacherData?.rate >= 1) return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND, error: "Teacher Rate Error" })

        // Getting Comission
        let Commission = await CommissionModel.findOne({ serviceName: "Meeting" })
        let meetingCommission = Commission?.serviceCommission
        console.log("This is the meeting commission", meetingCommission)


        let TransactionPayload = {
            title: "Instant Meeting",
            buyer: currentUser?._id,
            sources: [],
            sellers: [],
            orderType: "meeting",
            sourceModel: "MeetingModel",
            orderPrice: 0,
            balance: 0,
            buyerCharges: 0,
            sellerCharges: 0,
            comissionPercent: meetingCommission,
            adminBalance: 0,
        }
        let MeetingPayload = {
            title: `Instant Meeting`,
            thoughts,
            startDate,
            admin: TeacherData?._id,
            participants: [currentUser?._id]
        }

        TransactionPayload.orderPrice = Number(TeacherData.rate);

        let CommissionBalance = Number((TransactionPayload.orderPrice * (meetingCommission / 100)).toFixed(2))

        TransactionPayload.buyerCharges = CommissionBalance;
        TransactionPayload.sellerCharges = CommissionBalance;
        TransactionPayload.adminBalance = TransactionPayload.buyerCharges + TransactionPayload.sellerCharges;
        TransactionPayload.balance = TeacherData?.rate + TransactionPayload.buyerCharges;

        let sellerBalance = TeacherData?.rate - TransactionPayload.sellerCharges;

        let CreteNotification
        const MongoSession = await mongoose.startSession();
        await MongoSession.withTransaction(async (transaction) => {
            const MeetingData = new MeetingModel(MeetingPayload);
            MeetingData.$session(transaction);
            await MeetingData.createRoomID();
            await MeetingData.save();

            const TransactionData = new TransactionModel(TransactionPayload);
            TransactionData.$session(transaction);
            TransactionData.sources = [MeetingData?._id];
            TransactionData.sellers = [{ userData: TeacherData?._id, sources: [MeetingData?._id], orderPrice: Number(TeacherData.rate), charges: CommissionBalance, balance: sellerBalance }]

            let paymentMethod = await STRIPE.tokens.create({
                card: {
                    number: '4242424242424242', // Card number
                    exp_month: 12, // Expiration month (2-digit format)
                    exp_year: 2024, // Expiration year (4-digit format)
                    cvc: '123', // CVC/CVV security code
                },
            });
            if (!paymentMethod.id) {
                await transaction.abortTransaction()
                return res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Error While Adding Card" })
            }
            let Pay = await STRIPE.charges.create({
                amount: (TransactionPayload.balance * 100).toFixed(0),
                currency: 'usd',
                source: paymentMethod?.id,
                metadata: {
                    transactionId: TransactionData?._id,
                    firstName: currentUser?.firstName,
                    lastName: currentUser?.lastName,
                    email: currentUser?.email
                },
            });
            if (!Pay?.status == "succeeded") {
                await transaction.abortTransaction()
                return res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Transaction Failed" })
            }

            TransactionData.status = "paid";
            TransactionData.invoice = Pay?.receipt_url;
            await TransactionData.save();

            CreteNotification = new NotificationModel({
                type: TransactionData.orderType,
                from: currentUser?._id,
                to: TransactionData.sellers?.map(data => data?.userData?._id),
                source: TransactionData._id,
                title: `${currentUser?.firstName} Book a Meeting`
            })
            CreteNotification.$session(transaction)
            await CreteNotification.save()
        })

        await MongoSession.endSession();

        // Email Send Code
        await SendEmail({ email: TeacherData?.email, subject: "Meeting Booked", code: `${currentUser?.firstName} ${currentUser?.lastName} Booked a Meeting` });



        res.status(STATUS_CODE.CREATED).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, notificationId: CreteNotification?._id })
    } catch (err) {
        console.log("&&&&&&&&&&", err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const startPaidMeeting = catchAsync(async (req, res, next) => {
    let currentUser = req.user
    let { id } = req.params;
    try {
        const result = await MeetingModel.findByIdAndUpdate(id, { status: "completed" })
        if (!result) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND, error: "Meeting Not Found" })
        }

        res.status(STATUS_CODE.CREATED).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        console.log("&&&&&&&&&&", err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

module.exports = { getAllMeetings, getMeetingByID, createMeetinglink, getMeetingLinkWithShortLink, createPaidMeetinglink, getAllPaidMeetings, startPaidMeeting };