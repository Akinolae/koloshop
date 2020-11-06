const express = require("express");
const path = require("path");
const expressLayout = require("express-ejs-layouts");
const passport = require("passport");

const flash = require("connect-flash");
const session = require("express-session");
const {
  authenticated
} = require("./config/ensureAuth");
const {
  isAuthenticated,
} = require('./src/js/Oauth');
const service = require('./service/Userrequests/userReq');
require('./service/loginAuth/loginAuth')(passport);
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
app.use(expressLayout);
app.set("view engine", "ejs");

// initializing passport middleware
app.use(passport.initialize());
app.use(passport.session());

// get requests.
app.get("/", (req, res) => {
  res.render("login");
});

app.get('/account', (req, res) => {
  res.render("account");
});

app.get('/resetpassword/:id', isAuthenticated, (req, res) => {
  // res.render('resetpassword');co
  const token = req.params.id;
  JWT.verify(req.token, 'koloshop', (err, authenticated) => {
    if (err) {
      res.statusCode(400)
    } else {
      // res.render('resetpassword', {
      // authenticated
      // })
      console.log(req.token)
    }
  })
})

app.get('/cart', (req, res) => {
  res.render('cart');
})

app.get('/activate', (req, res) => {
  res.render('activate')
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

app.get("/mainpage", authenticated, service.getAllProducts);
// All get requests end here!
// ==========================

// POST request
// Registers each user.
app.post("/register", service.handleRegisterUser);
app.post("/passwordReset", service.handlePasswordReset );
app.post('/resetpassword', service.handlePasswordLink);

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
app.get("/users/:id", (req, res) => {
  const {
    id
  } = req.params;
  db.query("select * from users where user_id = ?", id, (err, data) => {
    res.json(data);
  })
})

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`server started on port ${PORT}`));