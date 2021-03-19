const pool = require("../../config/db");
const { BadRequest, InternalServerError, Unauthorized } = require("../utils/errors");
const { getOne, getConn,updateOne,insertOne } = require("../../db");
const { generateToken, hashIt, verifyHash,verifyAccessToken } = require("../utils");
const {sendCountryCodes,sendTimezones} = require("../utils");

exports.timezones = async (req,res)=>{
    try{
      const data = sendTimezones();
      res.status(200).json({
          data
      })
    }catch(e){
        if (e.status) {
            res.status(e.status).json({
                error: e.message,
            });
        } else {
            console.log(e);
            res.status(500).json({
                error: e.message,
            });
        }
    }
}

exports.countryCodes = async (req,res)=>{
    try{
      const data = sendCountryCodes();
      res.status(200).json({
          data
      })
    }catch(e){
        if (e.status) {
            res.status(e.status).json({
                error: e.message,
            });
        } else {
            console.log(e);
            res.status(500).json({
                error: e.message,
            });
        }
    }
}