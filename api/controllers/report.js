const pool = require("../../config/db");
const { BadRequest, InternalServerError, Unauthorized } = require("../utils/errors");
const { getOne, getConn,updateOne,insertOne } = require("../../db");
const {uploadMultiple,makePDF,deleteFiles, makePDFAndUpload} = require("../utils/index");
const { MulterError } = require("multer");



exports.addReport = async (req,res)=>{
    try{
        const connection = await getConn(pool);
        try{
          uploadMultiple(10,'report')(req,res,async err=>{
              if(err instanceof MulterError) throw new BadRequest(err);
              else if(err) throw new InternalServerError(err)
              const {title,summary} = req.body;
              if(!title) throw new BadRequest("title not provided")
              let array = req.files.map(f=>f.path)
              const [path,url]= await makePDFAndUpload(array);
              await deleteFiles([...array,path])
              const result = await insertOne(connection,{
                  table:'report',
                  data:{
                        title,
                        summary,
                        file_link:url,
                        elder_id:req.user.elder.id
                  }
              })
                res.status(200).send({
                    url,
                    reportId:result.insertId,
                    title,
                    summary
              })
           })
        }finally{
            pool.releaseConnection(connection);
        }
    }
    catch(e){
        console.log(e)
         if(e.status){
             res.status(e.status).send({
                 error:e.toString()
             })
         }else{
             res.status(500).send({
                 error:e.toString()
             })
         }
    }

}

// exports.getReport = async(req,res)=>{
//     try{
//         const connection = await getConn(pool);
//         try{
              
//             res.status(200).send({
//                 url,
//                 reportId:result.insertId
//               })
//            })
//         }finally{
//             pool.releaseConnection(connection);
//         }
//     }
//     catch(e){
//         console.log(e)
//          if(e.status){
//              res.status(e.status).send({
//                  error:e.toString()
//              })
//          }else{
//              res.status(500).send({
//                  error:e.toString()
//              })
//          }
//     }
// }