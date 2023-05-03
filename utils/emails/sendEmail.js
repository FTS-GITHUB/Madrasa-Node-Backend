const nodemailer = require('nodemailer');
const VerifyEmailTemplate = require("./templates/VerifyEmail");
require('dotenv').config();


const SendEmail = async (email,code)=>{
    mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
        }
    });

    mailDetails = {
        // from: 'mailsender193@gmail.com',
        from: 'dtdportal@gmail.com',
        to: email,
        subject: 'Verifying Your Email For Institute Panel',
        html: VerifyEmailTemplate(code)
    };
    
    await mailTransporter.sendMail(mailDetails)

}

module.exports = SendEmail;