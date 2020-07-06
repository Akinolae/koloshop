// All requred dependencies are imported below !
const express = require("express");
const path = require("path");
const nodemailer = require('nodemailer');
const encrypt = require("bcryptjs");
const expressLayout = require("express-ejs-layouts");
const passport = require("passport");
const db = require("./config/dbconn");
const flash = require("connect-flash");
const session = require("express-session");
const {
  authenticated
} = require("./config/ensureAuth");
const configuration = require("./config/gmailConfig");
const accountNumber = Math.floor(Math.random() * 10000000000);

//============================
require("./config/passportAuth")(passport);
const app = express();
// Initializing all middlewares
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  session({
    name: "ASESSION",
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
// app.use()
app.use(flash());
app.use(express.static(path.join(__dirname, "/src")));
app.use("uploads", express.static(path.join(__dirname, "uploads")));
app.set("port", process.env.PORT || 8000);
app.use(expressLayout);
app.set("view engine", "ejs");

require("./config/passportAuth")(passport);

// initializing passport middleware
app.use(passport.initialize());
app.use(passport.session());

// creating global variables!

// ================================

// Created a database connection to Mysql.
// It often requires the below parameters
db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("connected succesfully");
  }
});
// =======================================

// =================================

// ==================

// retrieve product data from the database

// All get requests!. getting the basic routes to the website!
// get requests

app.get("/", (req, res) => {
  res.render("login");
});

app.get('/account', (req, res)=> {
  res.render("account");
});

app.get('/resetpassword', (req, res) => {
  res.render('resetpassword');
})

app.get('/cart', (req, res)=> {
  res.render('cart');
})

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

app.get("/forgotPassword", (req, res) => {
  res.render("forgotPassword");
})

app.get("/mainpage", authenticated, (req, res) => {
  // query the database to display products
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
});

// All get requests end here!
// ==========================


// All post requests
// POST request
app.post("/save", (req, res) => {
  const {firstname, lastname, accounttype } = req.body;
  const user = {
    account_number: 202918826,
    firstname: firstname,
    lastname: lastname,
    accounttype: accounttype,
    accountbalance: 10000
  }
  console.log(user);
  db.query('INSERT INTO accounts SET ?', user, (err,data) => {
    if(err) {
      console.log(`${user.account_number} already exists`);
    };
    console.log(data)
    res.render("account");
  })
})

// Registers each user.
app.post("/register", (req, res) => {
  // deconstructing each data to be pushed into the database
  const {
    firstName,
    email,
    password,
    password2,
    user_age,
    address
  } = req.body;

  const error = [];

  db.query("SELECT user_email FROM users WHERE user_email = ?", email, (err, data)=> {
    if(data.length > 0){
      console.log(data);
      error.push({
        msg: `user with ${email} already exists`
      })
    } 
  });
  if(!email ){
    error.push({
      msg: "email is required"
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
  if (user_age > 80) {
    error.push({
      msg: "user age cannot be greater than 80 ",
    });
  }
  if (user_age < 18) {
    error.push({
      msg: "user must be 18 and above ",
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
    const date = new Date();

    // the object to be added to the database
    const user = {
      user_name: firstName,
      user_email: email,
      user_password: hash,
      user_age: user_age,
      user_address: address,
      reg_date: date,
    };
    const dbError = [];
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
});


//password reset 
// Nodemailer is used here to send information to the email the user provided.
// It checks that user exists before it carries out the assignment given to it.
// It sends a string of messages upon completion of tasks
// If you have any errors with my code, kindly visit the nodemailer website for more clarity. Thanks.

app.post("/passwordReset", (req, res) => {
  const error = [];
  
  const { email } = req.body;
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

        async function main() {

          // create reusable transporter object using the default SMTP transport
          let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: configuration.gmailAccount().email, // Specific gmail account which can be found in the config file which may not be available to you.
              pass: configuration.gmailAccount().password, // Specific gmail account which can be found in the config file which may not be available to you.
            },
            tls: {
              rejectUnauthorized: false
            }
          });

          // send mail with defined transport object
          let info = await transporter.sendMail({
            from: `Koloshop app ${configuration.gmailAccount().email}`, // sender address
            to: email,  //reciever address that was gotten from the frontend/client
            subject: "Password rest from Koloshhop",
            text: "<p>click<a href='http://localhost:8000/resetpassword'> here</a> to rest your password</p>", // plain text body
            html: "<b>Paasword reset</b>", // html body
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

})

app.put('/resetpassword', (req, res) => {
  console.log(req.body);
})

// This handles the transaction request of each user.
app.post("/user/api/cart/", (req, res) => {
  const {
    user_id,
    user_address,
  } = req.user;

  const {
    number_of_purchases,
    product_name,
    total_price
  } = req.body;
  const transaction_code = Math.floor(Math.random() * 100000);

  let transactions = {
    transaction_id: transaction_code,
    customer_id: user_id,
    product_name: product_name,
    number_of_purchases: number_of_purchases,
    address: user_address,
    total_price: total_price,
  }
  db.query('INSERT INTO Transactions SET ?', transactions, (err, data) => {
    if (err) throw err;
    res.json({
      status: 200,
      message: `Dear ${user_name}, your order details has been sent to ${user_email}.`
    })
  })
})

// Login authentication.
// secured login processs.
app.post(
  "/koloshop/api/server/login",
  passport.authenticate("local", {
    successRedirect: "/mainpage",
    failureRedirect: "/login",
    failureFlash: true,
    msg: "invalid login parameters"
  })
);

// example
app.get("/users/:id", (req, res)=> {
  const { id } = req.params;
  db.query("select * from users where user_id = ?", id, (err, data)=> {
    res.json(data);
  })
})

const port = app.get("port");
app.listen(port, () => console.log(`server started on port ${port}`));
console.log("=======================");