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
exports.addCaretakers = async (req,res)=>{
    try{
        const connection = await getConn(pool);
        try{
            const {name,mobileno,country_code} = req.body;
            if(!name || !country_code || !mobileno) throw new BadRequest("Required fields are not provided");

            await insertOne(connection,{
                table:'careTakers',
                data:{
                    name,
                    country_code,
                    mobileno,
                    elderId:req.user.elder.id,
                    
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


exports.addReminder = async(req,res)=>{
    try{
        const connection = await getConn(pool);
        try{
            //slots = {"Sunday":"0|1|2|3|4|","Monday":"7|8",.........}
            const {rtype,ctype,mem,slvl,slots,name} = req.body;
            console.log(req.body)
            if(rtype==undefined || ctype==undefined || !name || !mem || slvl==undefined || !slots) throw new BadRequest("Required fields are not provided");

            const result = await insertOne(connection,{
                table:'timing',
                data:slots
            })
            let voice_mem=null,text_mem=null;
            if(ctype==0) voice_mem=mem;
            else text_mem=mem;

            const reminder = await insertOne(connection,{
                table:'reminder',
                data:{
                    elderId:req.user.elder.id,
                    rtype,
                    ctype,
                    voice_mem,
                    text_mem,
                    slot:result.insertId,
                    sugar_lvl:slvl,
                    name
                }
            })

            let slotsModified = {...slots};
            for(x in slotsModified){
                slotsModified[x]=slotsModified[x].split("|").map(s=>Number(s));
            }
            let timezones = await getOne(connection,{
                 tables:'timezones',
                 fields:'toffset',
                 conditions:'timezone=?',
                 values:[req.user.elder.timezone]
                })
            const offset = timezones[0].toffset;
            for(let i =0;i<=slotsModified.length-1;i++){
                for(let j=0;j<=slotsModified[i].length-1;j++){
                    let time = getTime(slotsModified[x][y]);
                    let value=start+offset;
                    if(value>=24){
                        for(let k=0;k<=slotsModified[(i+1)%slotsModified.length].length-1;k++){
                            if(getTime(a[k+1]).start>(value-24)){
                                 slotsModified[(i+1)%slotsModified.length].splice(k,0,floor(value-24));
                                 break;
                            }
                        }
                        slotsModified[i].splice(i,1);
                        i=i-1;
                    }if(value<0){
                        for(let k=slotsModified[(i-1)%slotsModified.length].length-1;k>=0;k--){
                            if(getTime(a[k-1]).start<(value+24)){
                                 slotsModified[(i-1)%slotsModified.length].splice(k,0,floor(value+24));
                                 break;
                            }
                        }
                        slotsModified[i].splice(i,1);
                        i=i-1;
                    }
                }
            }
            // for(let i=0;i<=noTimes;i++)
            for(let x in slotsModified){
                for(let y of slotsModified[x]){
                    await insertOne(connection,{
                        table:'reminderCombination',
                        data:{
                         remId:reminder.insertId,
                         daySlot:getDaySlot(x),
                         timeSlot:y
                        }
                    })
                }
            }



            res.status(200).send({
                reminderId:reminder.insertId
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



exports.startReminder = async (req,res)=>{
    try{
        const connection = await getConn(pool);
        try{

            const remId = req.params.id;

            let date = new Date();
            // console.log(date.getDay(),remId);

            const result = await getOne(connection,{
                tables:`reminderCombination `,
                fields:'daySlot,count(id) ',
                conditions:'remId=? group by daySlot order by daySlot',
                values:[remId]
            });
      
            if(!result.length) throw new BadRequest("Invalid remId");

            let i=0,c=1,check=0;
            let data=[];
            while(c){
    
               if(date.getDay()+1<=result[i].daySlot){

                    data = await getOne(connection,{
                        tables:`reminderCombination `,
                        fields:'daySlot,id,timeSlot',
                        conditions:'remId=? and daySlot=?',
                        values:[remId,result[i].daySlot]
                    })
                    break;
               }
               i++;
               if(i==result.length) c=0;
            }
            i=0;
            while(!c){
                if(date.getDay()+1>=result[i].daySlot){
    
                    data = await getOne(connection,{
                        tables:`reminderCombination `,
                        fields:'daySlot,id,timeSlot',
                        conditions:'remId=? and daySlot=?',
                        values:[remId,result[i].daySlot]
                    })
                    break;
               }
               i++;
               if(i==result.length) c=0;
            }
    

            for(x in data){
               
                await insertOne(connection,{
                    table:'reminderLogs',
                    data:{
                     remComId:data[x].id,
                     elderId:req.user.elder.id,
                     status:'upcoming',
                     triedTimes:0,
                     checkLast:i==data.length-1?1:0
                    }
                })
            
            }
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


exports.getReminders =async (req,res)=>{
    try{
        const connection = await getConn(pool);
        try{

            const result = await getOne(connection,{
                tables:`reminder`,
                fields:'*',
                conditions:'',
                values:[]
            });
            res.status(200).send({
                reminders:result
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