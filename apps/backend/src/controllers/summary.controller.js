const summaryService = require("../services/summary.service");

const calculateAndSaveSummary = async (userId, targetDate) => {
    return await summaryService.calculateAndSaveSummary(userId, targetDate);
};

const getTodaySummary = async (req, res, next) => {
    try {
        const summary = await summaryService.getTodaySummary(req.user.id);
        return res.json(summary);
    } catch (error) {
        next(error);
    }
};

const updateSummary = async (req, res, next) => {
    try {
        const updatedSummary = await summaryService.updateSummary(req.user.id, req.body);
        return res.json(updatedSummary);
    } catch (error) {
        next(error);
    }
};

const getSummaryByRange = async (req, res, next) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            return res.status(400).json({ success: false, message: "start and end dates are required" });
        }
        const summaries = await summaryService.getSummaryByRange(req.user.id, start, end);
        return res.json(summaries);
    } catch (error) {
        next(error);
    }
};

const getWeeklyReport = async (req, res, next) => {
    try {
        const report = await summaryService.getWeeklyReport(req.user.id);
        return res.json(report);
    } catch (error) {
        next(error);
    }
};

const getSummaryDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const details = await summaryService.getSummaryDetails(req.user.id, id);
        return res.json(details);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    calculateAndSaveSummary,
    getTodaySummary,
    updateSummary,
    getSummaryByRange,
    getWeeklyReport,
    getSummaryDetails,
};
