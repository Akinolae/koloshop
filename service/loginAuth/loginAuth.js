const localStrategy = require("passport-local").Strategy;
const encrypt = require("bcryptjs");
const user = require('../../config/dbconn');

module.exports = function (passport) {
    passport.use(
        new localStrategy({
                usernameField: "email",
                passwordField: "password"
            },
            (user_email, user_password, done) => {
                const msg = [];
                user.query(
                    "SELECT * FROM users WHERE user_email = ?",
                    [user_email],
                    (err, data) => {
                        if (err) {
                            return done(null, false, msg.push({
                                err
                            }));
                        }
                        if (!data.length) {
                            return done(null, false, msg.push({
                                err: "no user found",
                            }))
                        }
                        if (!user_email) {
                            return done(null, false, msg.push({
                                message: `user with ${user_email} doesn't exist!`
                            }))
                        }
                        decryptedPassword = encrypt.compareSync(
                            user_password,
                            data[0].user_password
                        );
                        if (!decryptedPassword) {
                            return done(null, false, msg.push({
                                messsage: "password incorrect"
                            }))
                        }
                        if (decryptedPassword) {
                            return done(null, data[0]);
                        }
                    }
                );
            }
        )
    );
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });
};