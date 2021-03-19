const mysql = require("mysql");
require("dotenv").config();


const pool = mysql.createPool({
    host     : process.env.HOSTDB,
    user     : process.env.USER,
    password : process.env.PASSWORD,
    database : process.env.DATABASE
})


module.exports = pool;