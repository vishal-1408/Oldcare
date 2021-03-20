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


//HEART MONITOR
exports.addData = async (req,res)=>{
    try{
        const connection = await getConn(pool);
        try{
            const {bpm,deviceToken,footsteps} = req.body;
            if(!bpm || !deviceToken || !footsteps) throw new BadRequest("Required details are not provided!");
            console.log(req.body);
            const result = await getOne(connection,{
                tables:'elder inner join (select id from device where token=?) as device',
                fields:'elder.id',
                conditions:'elder.device_id=device.id',
                values:[deviceToken]
            })

            if(!result.length) throw new BadRequest("Device token is not matching with any device");

            const date =  new Date();

            const result2 =  await getOne(connection,{
                tables:'footsteps',
                fields:'steps',
                conditions:'elder_id=? and CAST(created_at as date)=?',
                values:[result[0].id,`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`]
            })
            
            if(!result2.length){

                await insertOne(connection,{
                    table:'footsteps',
                    data:{
                        elder_id:result[0].id,
                        steps:footsteps
                    }
                })
            }else{
                await updateOne(connection,{
                    tables:'footsteps',
                    fields:'steps=?',
                    conditions:'elder_id=? and CAST(created_at as date)=?',
                    values:[result2[0].steps+footsteps,result[0].id,`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`]
                })
            }

            await insertOne(connection,{
                table:'heartMonitor',
                data:{
                    elder_id:result[0].id,
                    bpm
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

exports.getHeartData = async (req,res)=>{
    try{
        const connection = await getConn(pool);
        try{
              const {date,option} = req.body;
              if(!date || !option) throw new BadRequest("REQUIRED FIELDS NOT PROVIDED");
              let data=await getData(connection,'heartMonitor',date,option,req.user.elder.id,req.user.elder.timezone,"bpm")
            res.status(200).send({
                data
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



async function getData(connection,table,date,option,elderId,timezone,data){
    let result = [];
    switch(option){
        case 'date':
            result = await getOne(connection,{
                tables:table+` inner join (select created_at,avg(${data}) as dayAvg from ${table} 
                group by CAST(created_at as Date)) as second`,
                fields:`${table}.created_at,${data},second.dayAvg`,
                conditions:`CAST(${table}.created_at as Date)=CAST(second.created_at as Date) and elder_id=? and MONTH(${table}.created_at)=MONTH(?)`,
                values:[elderId,date]
            })
            break;
        case 'week':
            result = await getOne(connection,{
                tables:`(select elder_id,${table}.created_at,avg(${data}) from ${table} group by ${table}.created_at) as first 
                inner join (select WEEK(${table}.created_at) as weeks ,avg(${data}) as weekAverage
                from ${table}
                group by WEEK(${table}.created_at)) as second`,
                fields:'*',
                conditions:`MONTH(first.created_at)=MONTH(?) AND YEAR(first.created_at)=YEAR(?)AND WEEK(first.created_at)=second.weeks
                and elder_id=?;`,
                values:[date,date,elderId]
            });
            break;
        case 'month':
            result = await getOne(connection,{
                tables:`(select elder_id,${table}.created_at,avg(${data}) AS weeksAvg,week(${table}.created_at) as weekno
                 from ${table} group by WEEK(${table}.created_at)) as first 
                inner join (select MONTH(${table}.created_at) as monthno ,avg(${data}) as monthsAvg
                from ${table}
                group by MONTH(${table}.created_at)) as second`,
                fields:'*',
                conditions:`MONTH(first.created_at)=MONTH(?) AND YEAR(first.created_at)=YEAR(?)AND MONTH(first.created_at)=second.monthno
                and elder_id=?;`,
                values:[date,date,elderId]
            });
            break;
    }
    console.log(result)

    return result.map(r=>{
        let date= new Date(r.created_at).toLocaleString('en-US',{timeZone:timezone})
        return{
            ...r,
            created_at:date
        }
    });
}