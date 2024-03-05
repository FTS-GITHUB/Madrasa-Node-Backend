const express = require("express");

// Models :
const UserModel = require("../../model/user");
const TransactionModel = require("../../model/transaction");
const BookModel = require("../../model/book")
const NotificationModel = require("../../model/notifications");

// STRIPE :
const { STRIPE, TransaferAmountToCustomer } = require("../../utils/Stripe")
// Helpers :
const catchAsync = require("../../utils/catchAsync");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index");
const mongoose = require("mongoose");
const sendEmail = require("../../utils/emails/sendEmail");
const commissionModel = require("../../model/commission");
const BookingModel = require("../../model/booking");
const userModel = require("../../model/user");
const DonationModel = require("../../model/donation");





// This is the Transaction Post API
const addTransaction = catchAsync(async (req, res) => {
    const currentUser = req.user;

    let { sources, orderType, shippingDetails } = req.body;
    let { firstName, lastName, email, address, country, city, postalCode, contactNumber } = shippingDetails;


    try {
        if (!sources || !orderType || !shippingDetails || !email || !firstName || !lastName || !address || !country || !city || !postalCode || !contactNumber) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: { root: ["sources", "orderType", "shippingDetails"], shippingDetails: ["firstName", "lastName", "email", "address", "country", "city", "postalCode", "contactNumber"] } })
        }

        // Find If Book Already Purchesed 
        let PurchesedSources = []
        let PrechasedCheckProcess = sources.map(async s => {
            let isExists = await BookingModel.exists({ buyer: currentUser?._id, "details.sources.bookData": s })
            if (isExists) {
                let bookData = await BookModel.findById(s);
                PurchesedSources.push(bookData.title)
            }
        })
        await Promise.all(PrechasedCheckProcess);
        if (PurchesedSources.length >= 1) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: PurchesedSources.join(" | ") + " Books Already Purchesed" })
        }

        // Commission Dynamically handle
        let CommissionBook = await commissionModel.findOne({ serviceName: "Book" })

        let payload = {
            ...req.body,
            buyer: currentUser?._id,
            sourceModel: "bookModel",
            orderPrice: 0,
            comissionPercent: CommissionBook.serviceCommission,
            balance: 0,
            buyerCharges: 0,
            sellerCharges: 0,
            adminBalance: 0,
            title: ""
        }

        let sallersPayload = {}
        let sellers = []

        const allSourcesData = await BookModel.find({ _id: { $in: sources } })
        if (allSourcesData && allSourcesData.length >= 1) {
            let process = allSourcesData.map((book, index) => {
                payload.orderPrice += Number(book.price);
                payload.title = payload.title.concat(index >= 1 ? ` | ${book.title.slice(0, 6)}` : book.title.slice(0, 6));
                sallersPayload[book?.auther?._id] = {
                    sources: Array.isArray(sallersPayload[book?.auther?._id]?.sources) ? [...sallersPayload[book?.auther?._id]?.sources, book?._id] : [book?._id],
                    orderPrice: sallersPayload[book?.auther?._id]?.orderPrice ? Number(sallersPayload[book?.auther?._id]?.orderPrice) + Number(book?.price) : Number(book?.price),
                    // charges: sallersPayload[book?.auther?._id]?.orderPrice ? (Number(sallersPayload[book?.auther?._id]?.orderPrice) + Number(book?.price)) * (CommissionBook?.serviceCommission / 100) : Number(book?.price) * (CommissionBook?.serviceCommission / 100), 
                }
            })
            await Promise.all(process)

            Object.keys(sallersPayload).map(key => {
                let calCharges = sallersPayload[key].orderPrice * (CommissionBook?.serviceCommission / 100)
                payload.adminBalance = payload.adminBalance + calCharges
                payload.sellerCharges = payload.sellerCharges + calCharges
                sellers.push({
                    userData: key,
                    sources: sallersPayload[key].sources,
                    orderPrice: sallersPayload[key].orderPrice,
                    charges: calCharges,
                    balance: sallersPayload[key].orderPrice - calCharges
                })
            })
        }
        if (isNaN(payload.orderPrice)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, details: "Source Price Issue" })
        }

        payload.buyerCharges = payload.orderPrice * (payload.comissionPercent / 100)
        payload.balance = payload.orderPrice + payload.buyerCharges;
        payload.adminBalance = payload.adminBalance + payload.buyerCharges
        payload["sellers"] = sellers

        let result = await TransactionModel.create(payload)

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })

    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }

})


// Add Free Transaction At this time Buy Free Book
const addFreeTransaction = catchAsync(async (req, res) => {

    try {

        let currentUser = req.user;

        let { sources, orderPrice, shippingDetails, orderType } = req.body;
        let { firstName, lastName, email } = shippingDetails;


        if (orderPrice > 0) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Source is Not Free" })
        }
        if (!sources || !orderType || !shippingDetails || !email || !firstName || !lastName) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: { root: ["sources", "orderType", "shippingDetails"], shippingDetails: ["firstName", "lastName", "email"] } })
        }

        // Find If Book Already Purchesed 
        let PurchesedSources = []
        let PrechasedCheckProcess = sources.map(async s => {
            let isExists = await BookingModel.exists({ buyer: currentUser?._id, "details.sources.bookData": s })
            if (isExists) {
                let bookData = await BookModel.findById(s);
                PurchesedSources.push(bookData.title)
            }
        })
        await Promise.all(PrechasedCheckProcess);

        let payload = {
            ...req.body,
            buyer: currentUser?._id,
            sourceModel: "bookModel",
            orderPrice: 0,
            balance: 0,
            buyerCharges: 0,
            sellerCharges: 0,
            adminBalance: 0,
            title: "",
            status: "paid"
        }

        let findBook = await BookModel.findOne({ _id: sources })
        payload.title = findBook?.title.slice(0, 10)

        // No Recording Transaction in case of Already Purchesed Free Book
        if (PurchesedSources.length >= 1) {
            return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, url: findBook?.file?.url })
            // return res.status(STATUS_CODE.BAD_REQUEST).json({ message: PurchesedSources.join(" | ") + " Book Already Purchesed" })
        }

        let TransactionData = new TransactionModel(payload)
        TransactionData.sellers = [{ userData: findBook?.auther?._id }]
        await TransactionData.save()


        let bookingObj = {
            transactionData: TransactionData?._id,
            sources: TransactionData?.sources.map(source => ({ bookData: source?._id }))
        }
        // Update Booking :
        const findBooking = await BookingModel.findOne({ buyer: currentUser?._id });
        if (findBooking) {
            findBooking.details.push(bookingObj);
            await findBooking.save();
        } else {
            let createBooking = await BookingModel.create({
                buyer: currentUser?._id,
                details: bookingObj
            })
        }

        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, url: findBook?.file?.url })
    } catch (err) {
        console.log(err);
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }

})

// This is Used to add Paymentds like Cards | BanckAccounts Etc , Post API
const addPaymentMethod = catchAsync(async (req, res, next) => {
    let currentUser = req?.user;
    let { cardNumber, expMonth, expYear, cvc, bookingId } = req.body;

    try {
        if (!cardNumber || !expMonth || !expYear || !cvc || !bookingId) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: ["cardNumber", "expMonth", "expYear", "cvc", "bookingId"] })
        }

        let TransactionData = await TransactionModel.findById(bookingId).populate({ path: "sellers", populate: "userData" });
        if (!TransactionData) {
            return res.status(STATUS_CODE.NOT_FOUND).json({ message: "Booking / Transaction Not Found" })
        }

        let UserData = currentUser || TransactionData.buyer

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

        let Process = TransactionData?.sellers?.map(async s => {
            if (s.userData?.stripId) {
                const transfer = await TransaferAmountToCustomer({ customerId: s.userData?.stripId, amount: (Number(s?.balance) * 100).toFixed(0) })
                if (!transfer) return res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, transfer })
            }


            // Making Sources Name with For each Sellers to Send Email
            if (Array.isArray(s.sources)) {
                let ProductName = s.sources.map(product => product?.title).join(" | ")
                await sendEmail({ email: s.userData?.email, subject: "Book Buyed", code: `${ProductName} Buyed by ${currentUser?.firstName} ${currentUser?.lastName}` })
            }
        })
        await Promise.all(Process);


        TransactionData.status = "paid";
        TransactionData.invoice = Pay?.receipt_url;
        await TransactionData?.save();


        let bookingObj = {
            transactionData: TransactionData?._id,
            sources: TransactionData?.sources.map(source => ({ bookData: source?._id }))
        }

        // Update Booking :
        const findBooking = await BookingModel.findOne({ buyer: UserData?._id });
        if (findBooking) {
            findBooking.details.push(bookingObj);
            await findBooking.save();
        } else {
            let createBooking = await BookingModel.create({
                buyer: UserData?._id,
                details: bookingObj
            })
        }


        let Notification = new NotificationModel({
            type: TransactionData.orderType,
            from: UserData?._id,
            to: TransactionData.sellers,
            source: TransactionData.orderType == "book" ? TransactionData?._id : TransactionData.sources[0],
            title: `${UserData?.firstName} make payment for ${TransactionData?.orderType}`
        })
        await Notification.save();

        if (TransactionData.orderType == "book") {
            sendEmail({ email: UserData?.email, subject: "Your Book Link", code: `<a href="https://madrasa-aws-s3-bucket.s3.eu-north-1.amazonaws.com/1256153b-4975-4e13-8d6f-91ddfc3968a8.pdf"> Download Book Here </a>` }, next)
        }

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, url: TransactionData?.invoice, notificationId: Notification._id })
    } catch (err) {
        console.log("fskjfl", err)
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

const addBalance = catchAsync(async (req, res) => {
    const { customerId, amount, currency } = req.body
    try {
        const result = await STRIPE.customers.createBalanceTransaction(
            customerId,
            {
                amount: amount,
                currency: currency
            }
        )
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result: result })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


// Customer Get API from stripe
const customerBalance = catchAsync(async (req, res) => {
    const currentUser = req.user
    try {
        let { stripId } = currentUser;

        if (!stripId) return res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.STRIP_ERROR })

        const result = await STRIPE.customers.retrieve(stripId)
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        console.log("this is the error", err)
        return res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// Update Customer Data API from stripe
const customerUpdate = catchAsync(async (req, res) => {
    const updateData = req.body
    try {
        const updateCustomer = await STRIPE.customers.update(updateData?.id, { name: updateData?.name, email: updateData?.email })
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result: updateCustomer })
    } catch (err) {
        console.log("this is the error", err)
        return res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// Get All Customers Data from stripe API
const getAllCustomers = catchAsync(async (req, res) => {
    try {
        const getCustomers = await STRIPE.customers.list({})
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result: getCustomers })
    } catch (err) {
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
            const QUERY = {
                $or: [
                    { buyer: currentUser._id },
                    { 'sellers.userData': currentUser._id },
                ],
            };
            result = await TransactionModel.find(QUERY);
            // if (!result || !result.length >= 1) {
            //     let sid = new mongoose.Types.ObjectId(currentUser?._id)
            //     result = await TransactionModel.find({ sellerId: { $in: [sid] } });
            // }
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

const chargeDonation = catchAsync(async (req, res, next) => {

    try {
        let { amount, cardNumber, expMonth, expYear, cvc, shippingDetails, userId } = req.body;
        let { firstName, lastName, email } = shippingDetails;

        if (!amount || !cardNumber || !expMonth || !expYear || !cvc) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: ["amount", "cardNumber", "expMonth", "expYear", "cvc", "bookingId"] })
        }
        if (!shippingDetails || !email || !firstName || !lastName) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: { root: ["shippingDetails"], shippingDetails: ["firstName", "lastName", "email"] } })
        }



        let UserData = shippingDetails;
        const findUser = await userModel.findById(userId);
        if (findUser) {
            UserData["_id"] = findUser?._id
            UserData["firstName"] = findUser?.firstName
            UserData["lastName"] = findUser?.lastName
            UserData["email"] = findUser?.email
        }

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
            amount: (Number(amount) * 100).toFixed(0),
            currency: 'usd',
            source: paymentMethod?.id,
            metadata: {
                firstName: UserData?.firstName,
                lastName: UserData?.lastName,
                email: UserData?.email
            },
        });
        if (!Pay?.status == "succeeded") {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Transaction Failed" })
        }


        let result = await DonationModel.create({
            buyer: UserData?._id || null,
            balance: amount,
            shippingDetails
        })


        // let Notification = new NotificationModel({
        //     type: TransactionData.orderType,
        //     from: UserData?._id,
        //     to: TransactionData.sellers,
        //     source: TransactionData.orderType == "book" ? TransactionData?._id : TransactionData.sources[0],
        //     title: `${UserData?.firstName} make payment for ${TransactionData?.orderType}`
        // })
        // await Notification.save();



        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        console.log("fskjfl", err)
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})
const allDonation = catchAsync(async (req, res, next) => {
    try {
        const result = await DonationModel.find().sort({ createdAt: -1 });

        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        console.log("fskjfl", err)
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})


module.exports = { addPaymentMethod, addTransaction, getAllTransaction, getTransactionById, reviewTransaction, updateTransactionById, deleteTransactionById, addFreeTransaction, addBalance, customerBalance, customerUpdate, getAllCustomers, chargeDonation, allDonation };