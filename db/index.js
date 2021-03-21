exports.getConn = pool =>{
      return new Promise((resolve,reject)=>{
            pool.getConnection((error,connection)=>{
                  if(error) reject(error)
                  resolve(connection);
            });
      })
}



exports.getOne = (connection,config) =>{
     // console.log(`SELECT ${config.fields} FROM ${config.tables} ${config.conditions?`WHERE ${config.conditions}`:''}`)
    return new Promise((resolve,reject)=>{
      connection.query(`SELECT ${config.fields} FROM ${config.tables} ${config.conditions?`WHERE ${config.conditions}`:''}`,config.values,(error,data)=>{
            if(error) {console.log(error);reject(error)};
            resolve(data);
           });
    })
}


exports.insertOne = (connection, options) => {
      return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO ${options.table} SET ?`, options.data, (err, results) => {
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