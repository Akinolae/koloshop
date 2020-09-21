const mySql = require("mysql");
const dbPass = require('../config/auth');

const connection = mySql.createConnection({
    host: "localhost",
    user: "Akinola",
    password: dbPass.databasePassword(),
    database: "my_app",
});

module.exports = connection;