const express = require("express");
const {
    getTodaySummary,
    getSummaryByRange,
} = require("../controllers/summary.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const summaryRouter = express.Router();

summaryRouter.use(requireAuth);

summaryRouter.get("/today", getTodaySummary);
summaryRouter.get("/range", getSummaryByRange);

module.exports = summaryRouter;
