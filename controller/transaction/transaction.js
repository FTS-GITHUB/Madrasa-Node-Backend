const express = require("express");

// Models :
const UserModel = require("../../model/user");
const TransactionModel = require("../../model/transaction");
const BookModel = require("../../model/book")
const NotificationModel = require("../../model/notifications");

// STRIPE :
const STRIPE = require("../../utils/Stripe")
// Helpers :
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index");
const mongoose = require("mongoose");
const sendEmail = require("../../utils/emails/sendEmail");





// This is the Transaction Post API
const addTransaction = catchAsync(async (req, res) => {
    // const currentUser = req.user;

    let { buyerId, sources, orderType, shippingDetails } = req.body;
    let { firstName, lastName, email, address, country, city, postalCode, contactNumber } = shippingDetails;


    try {
        if (!sources || !orderType || !shippingDetails || !email || !firstName || !lastName || !address || !country || !city || !postalCode || !contactNumber) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: { root: ["sources", "orderType", "shippingDetails"], shippingDetails: ["firstName", "lastName", "email", "address", "country", "city", "postalCode", "contactNumber"] } })
        }

        let findUser = await UserModel.findOne({ email: email })
        req.body.buyerId = findUser?._id || null;
        // if (findUser) {
        // }

        const allSourcesData = await BookModel.find({ _id: { $in: sources } })
        req.body.orderPrice = 0;
        req.body.title = ""
        if (allSourcesData && allSourcesData.length >= 1) {
            let process = allSourcesData.map((book, index) => {
                req.body.orderPrice += Number(book.price);
                req.body.title = req.body.title.concat(index >= 1 ? ` | ${book.title.slice(0, 6)}` : book.title.slice(0, 6));
            })
            await Promise.all(process)
            req.body.sellerId = allSourcesData.map(source => source?.auther?._id)
        }
        if (isNaN(req.body.orderPrice)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, details: "Source Price Issue" })
        }

        // Charges == % of OrderPrice
        req.body.charges = req.body.orderPrice * (5/100)
        req.body.balance = req.body.orderPrice + req.body.charges;

        let result = await TransactionModel.create(req.body)

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })

    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }

})


// Add Free Transaction At this time Buy Free Book
const addFreeTransaction = catchAsync(async (req, res) => {
    let { buyerId, sources, orderPrice, shippingDetails, orderType } = req.body;
    let { firstName, lastName, email } = shippingDetails;
    console.log("-----", req.body)

    try {
        if (orderPrice > 0) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Source is Not Free" })
        }
        if (!sources || !orderType || !shippingDetails || !email || !firstName || !lastName) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: { root: ["sources", "orderType", "shippingDetails"], shippingDetails: ["firstName", "lastName", "email"] } })
        }

        let findUser = await UserModel.findOne({ email: email })
        req.body.buyerId = findUser?._id || null;
        req.body.charges = "Free"
        req.body.balance = "Free"
        req.body.orderPrice = "Free"
        req.body.status = "paid"
        let findBook = await BookModel.findOne({ _id: sources })
        req.body.title = findBook?.title.slice(0, 10)

        let newTransaction = new TransactionModel(req.body)
        await newTransaction.save()

        let result = findBook
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }

})

// This is Used to add Paymentds like Cards | BanckAccounts Etc , Post API
const addPaymentMethod = catchAsync(async (req, res, next) => {
    // As In This Case the user maybe a Register User or unregister User :
    let { cardNumber, expMonth, expYear, cvc, bookingId } = req.body;
    let UserData;

    try {
        if (!cardNumber || !expMonth || !expYear || !cvc || !bookingId) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: ["cardNumber", "expMonth", "expYear", "cvc", "bookingId"] })
        }

        let TransactionData = await TransactionModel.findById(bookingId).populate("buyerId");
        if (!TransactionData) {
            return res.status(STATUS_CODE.NOT_FOUND).json({ message: "Booking / Transaction Not Found" })
        }

        let UserData = TransactionData?.buyerId || TransactionData?.shippingDetails

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
            amount: (Number(TransactionData?.balance) * 100).toFixed(0),
            currency: 'usd',
            source: paymentMethod?.id,
            metadata: {
                transactionId: TransactionData?._id,
                firstName: UserData?.firstName,
                lastName: UserData?.lastName,
                email: UserData?.email
            },
        });
        if (!Pay?.status == "succeeded") {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Transaction Failed" })
        }

        TransactionData.status = "paid";
        TransactionData.invoice = Pay?.receipt_url;
        await TransactionData?.save();

        let Notification = new NotificationModel({
            type: TransactionData.orderType,
            from: UserData?._id,
            to: TransactionData.sellerId,
            source: TransactionData.orderType == "book" ? TransactionData?._id : TransactionData.sources[0],
            title: `${UserData?.firstName} make payment for ${TransactionData?.orderType}`
        })
        await Notification.save();

        if (TransactionData.orderType == "book") {
            sendEmail({ email: UserData?.email, subject: "Your Book Link", code: `<a href="https://madrasa-aws-s3-bucket.s3.eu-north-1.amazonaws.com/1256153b-4975-4e13-8d6f-91ddfc3968a8.pdf"> Download Book Here </a>` }, next)
        }

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result: TransactionData, notificationId: Notification._id })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }

})

const createCustomer = catchAsync(async (req, res) =>{
    const {name , email} = req.body

    try{
        const customer = await STRIPE.customers.create({
            name : name,
            email : email,
            description : "This Account is Under the Madrasa.io"
        })
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result: customer })
    } catch(err){
        console.log("this is the err", err)
        return res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const customerGet = catchAsync(async (req, res)=>{
    const {customerId} = req.body
    try {
        const customer = await STRIPE.customers.retrieve(customerId)
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result: customer })
    } catch(err){
        console.log("this is the error", err)
        return res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const customerUpdate = catchAsync(async(req, res)=>{
    const updateData = req.body
    try{
        const updateCustomer = await STRIPE.customers.update(updateData?.id, {name:updateData?.name, email : updateData?.email})
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result: updateCustomer })
    } catch (err){
        console.log("this is the error", err)
        return res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const getAllCustomers = catchAsync(async(req, res)=>{
    try{
        const getCustomers = await STRIPE.customers.list({})
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result: getCustomers })
    } catch (err){
        console.log("this is the error", err)
        return res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }

})


// This is the Transaction Get API
const getAllTransaction = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        let result;
        if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(currentUser.role?.name) || currentUser?.isSuperAdmin) {
            result = await TransactionModel.find({});
        } else {
            result = await TransactionModel.find({ buyerId: currentUser._id });
            if (!result || !result.length >= 1) {
                let sid = new mongoose.Types.ObjectId(currentUser?._id)
                result = await TransactionModel.find({ sellerId: { $in: [sid] } });
            }
        }
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.BAD_REQUEST, err })
    }
})

// This is the Transaction Get One API
const getTransactionById = catchAsync(async (req, res) => {
    let transactionId = req.params.id

    try {
        const FindOne = await TransactionModel.findById(transactionId)
        if (!FindOne) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
        }
        const result = await TransactionModel.findById(transactionId);
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is update Review Transaction API
const reviewTransaction = catchAsync(async (req, res) => {
    const { transactionId, status } = req.body;
    try {
        if (!status || status == "") {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELD })
        }
        const FindOne = await TransactionModel.findOne({ _id: transactionId, status: "pending" })
        if (FindOne) {
            if (FindOne.status == "approved" || FindOne.status == "rejected") {
                res.status(STATUS_CODE.BAD_REQUEST).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.ALREADY })
            } else {
                const result = await TransactionModel.findOneAndUpdate({ _id: transactionId }, { $set: { status: status } }, { new: true })
                return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE, result })
            }
        } else {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.ALREADY })
        }
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Transaction Patch API
const updateTransactionById = catchAsync(async (req, res) => {
    const updateData = req.body
    const transactionId = req.params.id;
    try {
        const FindOne = await TransactionModel.findById(transactionId)
        if (!FindOne) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
        }
        updateData.status = "pending"
        const result = await TransactionModel.findByIdAndUpdate(transactionId, { $set: updateData }, { new: true });
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Transaction Delete API
const deleteTransactionById = catchAsync(async (req, res) => {
    const currentUser = req.user
    const transactionId = req.params.id
    try {
        const FindOne = await TransactionModel.findById(transactionId)
        if (!FindOne) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
        }
        let result;
        if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(currentUser.role)) {
            result = await TransactionModel.findByIdAndDelete(transactionId);
        } else {
            result = await TransactionModel.findOneAndDelete({ _id: transactionId, auther: currentUser._id });
        }
        if (result) {
            return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE })
        }
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


module.exports = { addPaymentMethod, addTransaction, getAllTransaction, getTransactionById, reviewTransaction, updateTransactionById, deleteTransactionById, addFreeTransaction , createCustomer, customerGet, customerUpdate, getAllCustomers };