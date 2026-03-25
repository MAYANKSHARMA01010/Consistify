const express = require("express");
const {
    getDailyStatus,
    updateDailyStatus,
} = require("../controllers/dailyStatus.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const rateLimit = require("express-rate-limit");

const dailyStatusRouter = express.Router();

const dailyStatusLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs for these routes
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

dailyStatusRouter.use(requireAuth);
dailyStatusRouter.use(dailyStatusLimiter);

dailyStatusRouter.get("/", getDailyStatus);
dailyStatusRouter.post("/", updateDailyStatus);

module.exports = dailyStatusRouter;
