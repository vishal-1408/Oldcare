const customError = require("./CustomError")
const {StatusCodes,getReasonPhrase } = require("http-status-codes");


class Unauthorized extends customError{
    constructor(m){
        super(m);
        this.status = StatusCodes.UNAUTHORIZED;
        this.error = m.message

    }
}

module.exports = Unauthorized;