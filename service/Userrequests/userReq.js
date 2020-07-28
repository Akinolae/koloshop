const db = require("../../config/dbconn");
const {
    privateKey
} = require('../../src/js/Oauth');
const configuration = require("../../config/gmailConfig");

const encrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const JWT = require('jsonwebtoken');

// Created a database connection to Mysql.
// successful connection to the database
db.connect((err) => {
    if (err) {
        console.log(err)
    } else {
        console.log("connected succesfully");
    }
});

// each function performs user registration, password reset
module.exports = {
    getAllProducts: (req, res) => {
        db.query("SELECT * FROM Shoes", (err, result) => {
            db.query("SELECT * FROM Phones", (err, result2) => {
                db.query("SELECT * FROM Bags", (err, result3) => {
                    db.query("SELECT * FROM Clothes", (err, result4) => {
                        db.query("SELECT * FROM Wristwatches", (err, result5) => {
                            if (err) throw err;
                            res.render("mainpage", {
                                name: req.user,
                                result,
                                result2,
                                result3,
                                result4,
                                result5
                            })
                        })
                    })
                })
            })
        });
    },
    handleRegisterUser: (req, res) => {
        const {
            firstName,
            email,
            password,
            password2,
            user_age,
            address
        } = req.body;
        const error = [];
        db.query("SELECT user_email FROM users WHERE user_email = ?", email, (err, data) => {
            if (data.length > 0) {
                error.push({
                    msg: `user with ${email} already exists`
                })
            }
        });

        if (!email || !password || !user_age || !firstName || !address || !password2) {
            error.push({
                msg: "all fields are required"
            })
        }

        if (password !== password2) {
            error.push({
                msg: "passwords don't match ",
            });
        }

        if (password.length < 6) {
            error.push({
                msg: "password must be more than 6 characters ",
            });
        }
        if (!address) {
            error.push({
                msg: "Your address is required"
            })
        }

        if (error.length > 0) {
            res.render("register", {
                error,
            });
        } else {
            const hash = encrypt.hashSync(password);

            const user = {
                user_name: firstName,
                user_email: email,
                user_password: hash,
                user_age: user_age,
                user_address: address,
                reg_date: date,
            };

            db.query("INSERT INTO users SET ?", user, (err, results) => {
                if (err) {
                    dbError.push({
                        msg: `user ${firstName} or email ${email} already exists`,
                    });
                    res.render("register", {
                        dbError,
                    });
                } else {
                    res.redirect('/login');
                }
            });
        }
    },

    //password reset 
    // Nodemailer is used here to send information to the email the user provided.
    // It checks that user exists before it carries out the assignment given to it.
    // It sends a string of messages upon completion of tasks
    // If you have any errors with my code, kindly visit the nodemailer website for more clarity. Thanks.
    // handles password reset for each user.

    handlePasswordReset: (req, res) => {
        const error = [];
        const validateEmail = [];

        const {
            email
        } = req.body;

        if (!email) {
            validateEmail.push({
                message: "your email address is required for a password reset."
            })
            res.render('forgotPassword', {
                validateEmail
            })
        } else {
            db.query("SELECT user_email FROM users WHERE user_email = ?", email, (err, response) => {
                if (response.length === 0) {
                    error.push({
                        message: `user with ${email} doesn't exist.`,
                        message2: "kindly input a valid email address."
                    })
                    res.render("forgotPassword", {
                        error
                    })
                    // If the query returns a value
                } else if (response.length > 0) {
                    const resetToken = JWT.sign({
                        response
                    }, privateKey());
                    let responseText = `Dear shopper, we heard you forgot your password`;
                    async function main() {
                        // create reusable transporter object using the default SMTP transport
                        let transporter = nodemailer.createTransport({
                            host: "smtp.gmail.com",
                            port: 587,
                            secure: false, // true for 465, false for other ports
                            auth: {
                                user: configuration.gmailAccount().email, // Specific gmail account which can be found in the config file which may not be avail
                                pass: configuration.gmailAccount().password, // Specific gmail account which can be found in the config file which may not be av
                            },
                            tls: {
                                rejectUnauthorized: false
                            }
                        });
                        // send mail with defined transport object
                        let info = await transporter.sendMail({
                            from: `Koloshop app ${configuration.gmailAccount().email}`, // sender address
                            to: email, //reciever address that was gotten from the frontend/client
                            subject: "Password reset from Koloshop",
                            text: "<p>click<a href='http://localhost:8000/resetpassword'> here</a> to reset your password</p>", // plain text body
                            html: `
                                         ${responseText}
                        <p>click http://localhost:8000/resetpassword/${resetToken} to reset your password</p>`, // html body
                        });
                        console.log("Message sent: %s", info.messageId);
                        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                    }
                    main().catch(console.error);
                    // message to be sent to the user upon completion of transaction
                    const message = [];
                    message.push({
                        msg: `a link has been sent to ${email}`
                    })
                    res.render("forgotPassword", {
                        message
                    });
                }
            })
        }
    },

    // resetPasswordLink
    handlePasswordLink: (req, res) => {
        // Receive data from the user
        const {
            password,
            password2
        } = req.body;

        const passwordResetError = [];

        if (!password || !password2) {
            passwordResetError.push({
                msg: 'all fields are required'
            })
        }
        if (password !== password2) {
            passwordResetError.push({
                msg: `passwords don't match`
            })
        }

        res.render('resetpassword', {
            passwordResetError
        })
    }
}