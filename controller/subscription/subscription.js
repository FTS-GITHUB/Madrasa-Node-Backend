const express = require("express");

// Models :
const subscriptionModel = require("../../model/subscription");

// Helpers :
const jwt = require("../../utils/jwt");
const bycrypt = require("../../utils/bycrypt");
const SendEmail = require("../../utils/emails/sendEmail");
const crypto = require("crypto");
const catchAsync = require("../../utils/catchAsync");
const { STATUS_CODE, ERRORS, SUCCESS_MSG } = require("../../constants/index");

const emailSubscription = catchAsync(async (req, res, next) => {
  try {
    let email = req.body.email;

    if (!email) {
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ message: "Email is required" });
      return;
    }

    const isExist = await subscriptionModel.findOne({ email });
    if (isExist) {
      res
        .status(STATUS_CODE.DUPLICATE)
        .json({ message: ERRORS.UNIQUE.ALREADY_EMAIL });
      return;
    }

    const newSubscription = new subscriptionModel({ email, isSubscription: true });
    await newSubscription.save();

    await SendEmail(
      {
        email,
        subject: "Subscription Confirmation",
        code: "Thank you for subscribing!",
      },
      next
    );

    res
      .status(STATUS_CODE.OK)
      .json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUBSCRIPTION, isSubscription: newSubscription.isSubscription });
  } catch (err) {
    console.log(err);
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
  }
});

const getAllSubscribedUser = catchAsync(async (req, res) => {
  try {
    const data = await subscriptionModel.find({ isSubscription: true });

    // const email = data.map((user) => user.email);
    const subscribedUsers = data.map((user) => ({
      email: user.email,
      userId: user._id 
    }));

    res.status(STATUS_CODE.OK).json({message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, subscribedUsers: subscribedUsers  });
  } catch (err) {
      console.log(err);
      res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.BAD_REQUEST, err })
  }
})

//Api to send email to all subscribed User
const sendEmailToSubscribedUser = catchAsync(async (req, res, next) => {
  try {
    const { message, subscribedUsers } = req.body;
    

    if (!message) {
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ message: "Message is required" });
      return;
    }

    if (!subscribedUsers || !Array.isArray(subscribedUsers)) {
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ message: "Invalid or missing subscribedUsers array" });
      return;
    }
    const emailAddresses = subscribedUsers.map((user) => user.email);
    console.log(emailAddresses,"emailAddresses")
    for (const email of emailAddresses) {
      const isExist = await subscriptionModel.findOne({ email });

      if (!isExist) {
        res
          .status(STATUS_CODE.NOT_FOUND)
          .json({ message: `User ${email} is not subscribed` });
        return;
      }

      await SendEmail({
        email,
        subject: "Subscription Confirmation",
        code: message,
      });
    }

    res
      .status(STATUS_CODE.OK)
      .json({ message: "Emails sent to all subscribed users" });
  } catch (err) {
    console.log(err);
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
  }
});


const deleteSubscribedUser = catchAsync(async (req, res, next) => {
    try {
        let { id } = req.params;
        if (!id) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELDS_MISSING, fields: ["id"] })
        }
        const findSubcribedUser = await subscriptionModel.findById(id)
        if (!findSubcribedUser) {
            return res.status(STATUS_CODE.NOT_FOUND).json({ message: ERRORS.INVALID.NOT_FOUND })
        }
        if (findSubcribedUser.notDeleteAble) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: " Not DeleteAble" })
        }
        const result = await subscriptionModel.findByIdAndDelete(id)
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, result })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})
module.exports = { emailSubscription,getAllSubscribedUser,sendEmailToSubscribedUser,deleteSubscribedUser };
