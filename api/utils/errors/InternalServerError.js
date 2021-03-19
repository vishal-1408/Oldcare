const customError = require("./CustomError")
const {StatusCodes,getReasonPhrase } = require("http-status-codes");


class InternalServerError extends customError{
    constructor(m){
        super(m);
        this.status = StatusCodes.INTERNAL_SERVER_ERROR;
        this.error =m.message;

    }
}

module.exports = InternalServerError;