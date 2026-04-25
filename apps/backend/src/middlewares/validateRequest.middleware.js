const ApiError = require("../utils/ApiError");

const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const parsed = schema.parse(req.body);
            req.body = parsed;
            next();
        } catch (error) {
            const messages = error.errors.map((e) => e.message).join(", ");
            next(new ApiError(400, messages));
        }
    };
};

module.exports = validateRequest;
