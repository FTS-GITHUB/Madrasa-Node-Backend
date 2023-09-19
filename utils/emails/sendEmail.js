const nodemailer = require('nodemailer');
const SES = require("aws-sdk/clients/ses")
const VerifyEmailTemplate = require("./templates/VerifyEmail");
// const VerifyEmailTemplate = require("./templates/VerifyEmailTEMP");
require('dotenv').config();





const SendSMTPEmail = async ({ email, subject, code }, next) => {
    try {
        mailTransporter = nodemailer.createTransport({
            host: "madrasa.alphatechlogix.com",
            port: 465,
            secure: true,
            // host: "sandbox.smtp.mailtrap.io",
            // port: 2525,
            auth: {
                // user: "711a0c2aaed461",
                // pass: "36ad08b2e92fb2"
                user: "admin@madrasa.alphatechlogix.com",
                pass: "PPicf3CppuKT9L2"
            },
            debug: true, // show debug output
            logger: true // log information in console
        });

        mailDetails = {
            from: '"Team from Madrasa IO - Testing" <admin@madrasa.alphatechlogix.com>',
            to: email,
            subject: subject,
            html: VerifyEmailTemplate(code)
        };

        let res = await mailTransporter.sendMail(mailDetails)
        return res
    } catch (err) {
        next(err)
    }

}

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
// const SendAwsSESEmail = async ({ email, subject, code }, next) => {
const sendEmail = async ({ email, subject, code }, next) => {

    let ses = new SES({
        region: region,
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    })

    try {

        let params = { // SendEmailRequest
            Source: "info@madrasa.io", // required
            Destination: { // Destination
                ToAddresses: [email],
            },
            Message: { // Message
                Subject: { // Content
                    Data: subject, // required
                    Charset: "UTF-8",
                },
                Body: { // Body
                    Html: {
                        Data: VerifyEmailTemplate(code), // required
                        Charset: "UTF-8",
                    },
                },
            },
        };

        let res = await ses.sendEmail(params).promise();
        return res
    } catch (err) {
        console.log(err);
        next(err)
    }

}

// module.exports = SendSMTPEmail;
module.exports = sendEmail;
