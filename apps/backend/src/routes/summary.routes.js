const express = require("express");
const {
    getTodaySummary,
    getSummaryByRange,
    updateSummary,
    getSummaryDetails,
} = require("../controllers/summary.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const summaryRouter = express.Router();

summaryRouter.use(requireAuth);

summaryRouter.get("/today", getTodaySummary);
summaryRouter.get("/range", getSummaryByRange);
summaryRouter.get("/:id/details", getSummaryDetails);
summaryRouter.patch("/", updateSummary);

module.exports = summaryRouter;
