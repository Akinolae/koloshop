const { text } = require("express");
const nodemailer = require("nodemailer");
const config = require('../../config/gmailConfig');



const sendEmail = (email, subject, text, message ) => {
    async function main() {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: config.gmailAccount().email, // Specific gmail account which can be found in the config file which may not be avail
                pass: config.gmailAccount().password, // Specific gmail account which can be found in the config file which may not be av
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        let info = await transporter.sendMail({
            from: `Koloshop app ${config.gmailAccount().email}`, // sender address
            to: email, //reciever address that was gotten from the frontend/client
            subject: subject,
            text: text, // plain text body
            html: message, // html body
        });
    }
}

module.exports = sendEmail;