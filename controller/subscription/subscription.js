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

    const email = data.map((user) => user.email);

    res.status(STATUS_CODE.OK).json({message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL, subscribedUsers: email  });
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
    for (const email of subscribedUsers) {
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

module.exports = { emailSubscription,getAllSubscribedUser,sendEmailToSubscribedUser };
