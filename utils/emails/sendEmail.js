const nodemailer = require('nodemailer');
const VerifyEmailTemplate = require("./templates/VerifyEmail");
require('dotenv').config();

const SendEmail = async ({ email, subject, code }, next) => {
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
            from: '"Junaid from Madrasa IO - Testing" <admin@madrasa.alphatechlogix.com>',
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

module.exports = SendEmail;
