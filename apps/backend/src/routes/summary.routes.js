const express = require("express");
const rateLimit = require("express-rate-limit");
const {
    getTodaySummary,
    getSummaryByRange,
    updateSummary,
    getSummaryDetails,
} = require("../controllers/summary.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const summaryRouter = express.Router();

const summaryRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

summaryRouter.use(summaryRateLimiter);
summaryRouter.use(requireAuth);

summaryRouter.get("/today", getTodaySummary);
summaryRouter.get("/range", getSummaryByRange);
summaryRouter.get("/:id/details", getSummaryDetails);
summaryRouter.patch("/", updateSummary);

module.exports = summaryRouter;
