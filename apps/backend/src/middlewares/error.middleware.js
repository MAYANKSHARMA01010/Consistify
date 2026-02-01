const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = "Internal Server Error";

    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = "Invalid token";
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = "Token expired";
    } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = "Invalid JSON payload";
    } else {
        console.error("Unhandled Error:", err);
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports = errorHandler;
