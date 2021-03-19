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

const checkAuth = async (req, res,next) => {
    try {
        const token = req.headers["authorization"].replace("Bearer ", "");
        if (!token) throw new Unauthorized("Token not supplied");
        const user = verifyToken(token);
        req.user = {
            id: user.userId,
            email: user.email,
            name: user.name,
        };
        next();
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

module.exports = checkAuth;
