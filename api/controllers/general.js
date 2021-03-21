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

exports.reminderRoute = async (req,res)=>{
    try{
        const connection = getConn(pool);
        try{
         const remId = req.params.id;
             const result = await getOne(connection,{
               tables:'reminder',
               fields:'text_mem,voice_mem,rtype,ctype',
               conditions:'id=?',
               values:[remId]
             })
             if(!result.length) throw new Error("Invalid reminder")
             if(!result[0].ctype){
                 if(result[0].rtype){
 
                     const response = new VoiceResponse();
                     response.play({loop: 1}, result[0].voice_mem);
             
                     console.log(response.toString());
                 }else{
                     //for text_mem
                 }
             }else{
                 //for sugar level
             }
 
         }finally{
             pool.releaseConnection(connection)
         }
  
     }catch(e){
         console.log(e)
     }
 }
 
 exports.emergencyRoute = async (req,res)=>{
         try{
             console.log("camee")
             const response = new VoiceResponse();
             response.play({loop: 1}, 'https://test-bucket-j.s3.ap-south-1.amazonaws.com/songs/%5BiSongs.info%5D+01+-+Okey+Oka+Lokam.mp3');
             res.header('Content-Type', 'text/xml');
             res.send(response.toString());
  
     }catch(e){
         console.log(e)
     }
 }