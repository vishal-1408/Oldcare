const pool = require("../../config/db");
const { BadRequest, InternalServerError, Unauthorized } = require("../utils/errors");
const { getOne, getConn,updateOne,insertOne } = require("../../db");
const { generateToken, hashIt, verifyHash,verifyAccessToken } = require("../utils");
const crypto = require('crypto');



exports.addDevice = async (req,res)=>{
    try{
        const connection = await getConn(pool);
        try{
            const token = crypto.randomBytes(6).toString('hex');
            await insertOne(connection,{
                table:'device',
                data:{
                    token
                }
            })

            res.status(200).send({
                deviceToken:token
            })

        }finally{
            pool.releaseConnection(connection);
        }
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

exports.registerDevice = async (req,res)=>{
    try{
        const connection = await getConn(pool);
        try{
            const {token} = req.body;
            if(!token) throw new BadRequest("No token passed !")
            console.log(req.user);
            const result = await getOne(connection,{
                fields:'*',
                tables:'device',
                conditions:'user_id=? or token=?',
                values:[req.user.id,token]
            })
            if(!result.length) throw new BadRequest("Token is not associate with any device");

            result.forEach(r=>{
                if(r.user_id==req.user.id) throw new BadRequest("You have already registered a device");
                if(r.token==token && r.user_id) throw new BadRequest("The device is registered to some other person");
            })

            await updateOne(connection,{
                tables:'device',
                fields:'user_id=?',
                conditions:'token=?',
                values:[req.user.id,token]
            })
            res.status(200).send({
                message:'registered'
            })

        }finally{
            pool.releaseConnection(connection);
        }
    }catch(e){
        console.log(e);
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


