const express = require("express");

// Models :
const MeetingModel = require("../../model/meeting");
const UserModel = require("../../model/user");
const BookingModel = require("../../model/booking")
const TransactionModel = require("../../model/transaction")

// STRIPE :
const STRIPE = require("../../utils/Stripe")
// Helpers :
const catchAsync = require("../../utils/catchAsync");
const { STATUS_CODE, SUCCESS_MSG, ERRORS } = require("../../constants");
const MeetingURLGen = require("../../utils/zoomLinkgenrator");





const getAllMeetings = catchAsync(async (req, res, next) => {
    let currentuser = req.user;
    try {
        const result = await MeetingModel.find({ admin: currentuser?._id })
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
        const result = await BookingModel.find({ admin: currentuser?._id })
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const createPaidMeetinglink = catchAsync(async (req, res, next) => {
    try {

        let { firstName, lastName, email, teacherID, cardDetails } = req.body;


        let { cardNumber, expMonth, expYear, cvc } = cardDetails;

        if (!cardNumber || !expMonth || !expYear || !cvc) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: ["cardNumber", "expMonth", "expYear", "cvc"] })
        }

        const TeacherData = await UserModel.findById(teacherID);
        const UserData = await UserModel.findOne({ email: email })

        if (!TeacherData) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND, error: "Teacher Not Found" })
        }
        let MeetingBalance = ((Number(TeacherData?.rate || 6) / 10) + Number(TeacherData?.rate || 6)).toFixed(1)

        let paymentMethod = await STRIPE.tokens.create({
            card: {
                number: '4242424242424242', // Card number
                exp_month: 12, // Expiration month (2-digit format)
                exp_year: 2024, // Expiration year (4-digit format)
                cvc: '123', // CVC/CVV security code
            },
        });
        if (!paymentMethod.id) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Error While Adding Card" })
        }
        let Pay = await STRIPE.charges.create({
            amount: (MeetingBalance * 100).toFixed(0),
            currency: 'usd',
            source: paymentMethod?.id,
            metadata: {
                firstName,
                lastName,
                email
            },
        });
        if (!Pay?.status == "succeeded") {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Transaction Failed" })
        }

        let TransactionData = new TransactionModel({
            title: `Instant Meeting with ${TeacherData?.firstName} ${TeacherData?.lastName}`,
            orderPrice: TeacherData?.rate || 6,
            status: "paid",
            transactionType: "full",
            orderType: "meeting",
            // 5% of charges Round to one decimal
            balance: MeetingBalance,
            charges: (Number(TeacherData?.rate || 6) / 10).toFixed(1),
            invoice: Pay?.receipt_url
        })
        if (UserData) {
            TransactionData.buyerId = UserData?._id
        }
        await TransactionData.save();


        const MeetingURL = await MeetingURLGen({ title: "My Title" }, next)

        const MeetingData = new BookingModel({
            title: `Instant Meeting with ${TeacherData?.firstName} ${TeacherData?.lastName}`,
            firstName,
            lastName,
            email,
            admin: TeacherData?._id,
            type: "instantMeeting",
            ...MeetingURL
        })
        if (UserData) {
            MeetingData.studentId = UserData?._id
        }

        await MeetingData.save()

        let { adminLink, ...result } = MeetingData._doc;

        res.status(STATUS_CODE.CREATED).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })

    } catch (err) {
        console.log("&&&&&&&&&&", err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const startPaidMeeting = catchAsync(async (req, res, next) => {
    let currentUser = req.user
    let { id } = req.params;
    try {
        const result = await BookingModel.findByIdAndUpdate(id, { status: "completed" })
        if (!result) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND, error: "Meeting Not Found" })
        }

        res.status(STATUS_CODE.CREATED).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        console.log("&&&&&&&&&&", err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

module.exports = { getAllMeetings, createMeetinglink, getMeetingLinkWithShortLink, createPaidMeetinglink, getAllPaidMeetings , startPaidMeeting };