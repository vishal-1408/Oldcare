const pool = require("../../config/db");
const {
    BadRequest,
    InternalServerError,
    Unauthorized,
} = require("../utils/errors");
const { getOne, getConn, updateOne, insertOne } = require("../../db");
const {
    generateToken,
    hashIt,
    verifyHash,
    verifyAccessToken,
    verifyToken,
} = require("../utils");

const checkAuthWithElder = async (req, res,next) => {
    try {
        const connection = await getConn(pool);
        try {
            const token = req.headers["authorization"].replace("Bearer ", "");
            if (!token) throw new Unauthorized("Token not supplied");
            const user = verifyToken(token);
            const result = await getOne(connection, {
                tables: "elder",
                fields: "*",
                conditions: "user_id=?",
                values: [user.userId],
            });
            if (!result.length)
                throw new Unauthorized("You did not register any elder!");

            req.user = {
                elder: { ...result[0] },
                id: user.userId,
                email: user.email,
                name: user.name,
            };

            next();
        } finally {
            pool.releaseConnection(connection);
        }
    } catch (e) {
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

module.exports = checkAuthWithElder;
