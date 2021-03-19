exports.getConn = pool =>{
      return new Promise((resolve,reject)=>{
            pool.getConnection((err,connection)=>{
                  if(err) reject(error)
                  resolve(connection);
            });
      })
}


exports.getOne = (connection,config) =>{
    return new Promise((resolve,reject)=>{
      connection.query(`SELECT ${config.fields} FROM ${config.tables} WHERE ${config.conditions}`,config.values,(error,result)=>{
            if(error) reject(error)
            resolve(result);
           });
    })
}


exports.insertOne = (connection, options) => {
      return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO ${options.table_name} SET ?`, options.data, (err, results) => {
          if (err) return reject(err);
          return resolve(results);
        });
      });
    };


exports.updateOne = (connection,config) =>{
      return new Promise((resolve,reject)=>{
       connection.query(`UPDATE ${config.tables} SET ${config.fields} WHERE ${config.conditions}`,config.values,(error,result)=>{
             if(error) reject(error)
             resolve(result);
            });
      })
 }