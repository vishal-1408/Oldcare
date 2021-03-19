const pool = require("../../config/db");
const { BadRequest, InternalServerError, Unauthorized } = require("../utils/errors");
const { getOne, getConn,updateOne,insertOne } = require("../../db");
const { generateToken, hashIt, verifyHash,verifyAccessToken } = require("../utils");


exports.register = async (req,res)=>{
    try{
        const connection = await getConn(pool);
        try{
            const {name,age,mobileno,country_code,timezone,weight,height} = req.body;
            if(!name || !age || !mobileno || !country_code || !timezone || !weight || !height) throw new BadRequest("Required fields are not provided");
            const result = await getOne(connection,{
                tables:'device',
                fields:'id',
                conditions:'user_id=?',
                values:[req.user.id]
            })

            if(!result.length) throw new BadRequest("No device is registered under you");

            const result2 = await getOne(connection,{
                tables:'elder',
                fields:'id',
                conditions:'user_id=?',
                values:[req.user.id]
            })
            if(result2.length) throw new BadRequest("You have registered an elder already");
            await insertOne(connection,{
                table:'elder',
                data:{
                    name,
                    age,
                    mobileno,
                    country_code,
                    timezone,
                    weight,
                    height,
                    user_id:req.user.id,
                    device_id:result[0].id
                } 
            })

            res.status(200).send({
                message:'success'
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
