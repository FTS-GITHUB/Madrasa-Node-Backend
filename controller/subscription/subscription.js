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

    const newSubscription = new subscriptionModel({ email });
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
      .json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUBSCRIPTION });
  } catch (err) {
    console.log(err);
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err });
  }
});

module.exports = { emailSubscription };
