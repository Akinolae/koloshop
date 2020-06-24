// All requred dependencies are imported below !
const express = require("express");
const path = require("path");
const encrypt = require("bcryptjs");
const expressLayout = require("express-ejs-layouts");
const passport = require("passport");
const db = require("./config/dbconn");
const flash = require("connect-flash");
const session = require("express-session");
const {
  authenticated
} = require("./config/ensureAuth");
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
app.get("/", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

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



app.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});
app.get("/forgotPassword", (req, res)=> {
  res.render("forgotPassword");
})
app.get("/user_profile/:email", (req, res) => {
  const email = req.params.email;
  let found = false;
  database
    .select("user_email")
    .from("Users")
    .then((users) => {
      users.filter((user) => {
        if (user.user_email === email) {
          found = true;
          res.json(`user with email ${email} already exists`);
        } else {
          found = false;
          res.json(`${email} is valid!`);
        }
      });
    });
});

// All get requests end here!

// This handles the user registration
app.post("/koloshop/api/server/register", (req, res) => {
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
  if (!firstName || !email || !password || !user_age) {
    error.push({
      msg: "all fields are required! ",
    });
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
        res.redirect("register", {
          dbError,
        });
      } else {
        res.redirect('/login');
      }
    });
  }
});

app.post("/api/koloshop/servers/passwordReset", (req, res) => {
  const error = [];
  const { email } = req.body;
  db.query("SELECT user_email FROM users WHERE user_email = ?" , email , (err, response) => {
    if(response.length === 0){
      error.push({
        message: `user with ${email} doesn't exist`,
        message2: "it could be that you have input the wrong email or you haven't signed up on our website."

      })
      res.render("forgotPassword", {
        error
      })
      // console.log(error);
    }else if (response.length > 0){
    res.json({
      email
    })
    }
  })
  
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
app.post(
  "/koloshop/api/server/login",
  passport.authenticate("local", {
    successRedirect: "/mainpage",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

const port = app.get("port");
app.listen(port, () => console.log(`server started on port ${port}`));
console.log("=======================");