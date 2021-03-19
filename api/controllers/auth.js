const pool = require("../../config/db");
const { BadRequest, InternalServerError, Unauthorized } = require("../utils/errors");
const { getOne, getConn,updateOne,insertOne } = require("../../db");
const { generateToken, hashIt, verifyHash,verifyAccessToken, verifyToken } = require("../utils");
require("dotenv").config()
const jwt = require("jsonwebtoken")


exports.userGoogleAuth = async (req, res) => {
    try {
        const connection = await getConn(pool);
        try {
            const { accessToken} = req.body;

            if (!accessToken)
                throw new BadRequest("ACCESS TOKEN NOT SPECIFIED");

            const ticket = await verifyAccessToken(accessToken);

            const { email, name, picture } = ticket.getPayload();

            const searchedUser = await getOne(connection, {
                fields: `id, email, name, avatar`,
                tables: `user`,
                conditions: `email=?`,
                values: [email],
            });

            if (!seachedUser.length) {
                if (!picture) picture = process.env.DEFAULT_AVATAR;

                const result = await insertOne(connection, {
                    table: `user`,
                    data:{
                        name,
                        email,
                        password:hashedPassword,
                        role,
                        avatar:picture
                     }
                });
                searchedUser[0].id= result.insertId;
                searchedUser[0].name=name;
                searchedUser[0].email=email;
                searchedUser[0].avatar=picture;
            }

            const token = generateToken({
                userId: searchedUser[0].id,
                name: searchedUser[0].name,
                email: searchedUser[0].email,
            });


            return res.status(200).json({
                token,
                userDetails:{
                    name:searchedUser[0].name,
                    email:searchedUser[0].email,
                    avatar:searchedUser[0].avatar,
                    userId:searchedUser[0].id
                },
            });
        } finally {
            pool.releaseConnection(connection);
        }
    } catch (e) {
        //check this stuff!
        if (e.status) {
            console.log(e);
            return res.status(e.status).json({
                message: e.message,
            });
        }

        if (e) {
            console.log(e);
            res.status(500).json({
                error: e.message,
            });
        }
    }
};


////////////// role = 0 fo users
exports.userRegister = async (req, res) => {
    try {
        const connection = await getConn(pool);
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) throw new BadRequest("Required data not provided");

            if(password.length<7) throw new BadRequest("Password should contain min of 7 chars");
            
            const searchedUser = await getOne(connection, {
                fields: `id`,
                tables: `user`,
                conditions: `email=?`,
                values: [email],
            });
            if (searchedUser.length)
                throw new BadRequest("Email is already registered!");

          
            const hashedPassword = await hashIt(password);
            
          
            const result = await insertOne(connection, {
                table: `user`,
                data:{
                   name,
                   email,
                   password:hashedPassword,
                   role:0,
                }
            });

            const token = generateToken({
                name,
                email,
                userId: result.insertId,
            });

            // const info = await sendEmail(connection, email);

            res.status(200).json({
                token,
                userDetails:{
                    name,
                    email,
                    avatar:process.env.DEFAULT_AVATAR,
                    userId:result.insertId
                }
            });
        } finally {
            pool.releaseConnection(connection);
        }
    } catch (e) {
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
};

exports.userLogin = async (req, res) => {
    try {
        const connection = await getConn(pool);
        try {
            const {email,password} = req.body;
           
            if(!email || !password) throw new BadRequest("Required data is not provided");

 
            const searchedUser = await getOne(connection, {
                fields: `id, email, name, avatar, password,role`,
                tables: `user`,
                conditions: `email=?`,
                values: [email],
            });


            if(!searchedUser.length) throw new Unauthorized("Email is not registered with us!");

            const check = await verifyHash(password,searchedUser[0].password);

            if(!check) throw new Unauthorized("Password is incorrect!");

            const token = generateToken({
                userId: searchedUser[0].id,
                name: searchedUser[0].name,
                email: searchedUser[0].email,
            });


            res.status(200).json({
                token,
                userDetails:{
                    name:searchedUser[0].name,
                    email,
                    role:searchedUser[0].role,
                    avatar:searchedUser[0].avatar,
                    userId:searchedUser[0].id
                }
            })


        } finally {
            pool.releaseConnection(connection);
        }
    } catch (e) {
        console.log(e)
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
};