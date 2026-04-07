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
    } else if (err.code === "P2002") {
        statusCode = 409;
        message = "A record with these values already exists";
    } else if (err.status === 429) {
        statusCode = 429;
        message = err.message || "Too many requests";
    } else {
        console.error("Unhandled Error:", err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
};

module.exports = errorHandler;
