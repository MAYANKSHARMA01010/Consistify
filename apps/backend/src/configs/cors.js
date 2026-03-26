const cors = require("cors");
require("dotenv").config();

const allowedOrigins = new Set([
    process.env.FRONTEND_LOCAL_URL,
    process.env.FRONTEND_SERVER_URL,
]);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            callback(null, true);
        } 
        else {
            console.warn(`❌ Blocked by CORS: ${origin}`);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

module.exports = cors(corsOptions);