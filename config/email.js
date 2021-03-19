const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.WERK_EMAIL,
      pass: process.env.WERK_PASSWORD
    }
  });

module.exports=transporter;