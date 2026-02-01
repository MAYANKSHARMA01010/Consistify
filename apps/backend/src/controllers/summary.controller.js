const prisma = require("../configs/prisma").prisma;
const ApiError = require("../utils/ApiError");

const calculateAndSaveSummary = async (userId, date) => {
    try {
        const summaryDate = new Date(date);
        summaryDate.setUTCHours(0, 0, 0, 0);

        const statuses = await prisma.dailyTaskStatus.findMany({
            where: {
                userId,
                date: summaryDate,
            },
        });

        const totalTasks = statuses.length;
        const completedTasks = statuses.filter((s) => s.isCompleted).length;
        const points = completedTasks;

        let consistency = 0;
        if (totalTasks > 0) {
            consistency = (completedTasks / totalTasks) * 100;
        }

        const summary = await prisma.dailySummary.upsert({
            where: {
                userId_date: {
                    userId,
                    date: summaryDate,
                },
            },
            update: {
                totalTasks,
                completedTasks,
                points,
                consistency,
            },
            create: {
                userId,
                date: summaryDate,
                totalTasks,
                completedTasks,
                points,
                consistency,
            },
        });

        return summary;
    } catch (error) {
        console.error("Calculate Summary Error:", error);
        throw new ApiError(500, "Failed to calculate summary");
    }
};

const getTodaySummary = async (req, res, next) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const summary = await prisma.dailySummary.findUnique({
            where: {
                userId_date: {
                    userId: req.user.id,
                    date: today,
                },
            },
        });

        if (!summary) {
            return res.json({
                totalTasks: 0,
                completedTasks: 0,
                points: 0,
                consistency: 0,
            });
        }

        return res.json(summary);
    } catch (error) {
        next(error);
    }
};

const getSummaryByRange = async (req, res, next) => {
    try {
        const { start, end } = req.query;

        if (!start || !end) {
            throw new ApiError(400, "Start and end dates are required");
        }

        const startDate = new Date(start);
        if (isNaN(startDate.getTime())) {
            throw new ApiError(400, "Invalid start date");
        }
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(end);
        if (isNaN(endDate.getTime())) {
            throw new ApiError(400, "Invalid end date");
        }
        endDate.setUTCHours(23, 59, 59, 999);

        if (startDate > endDate) {
            throw new ApiError(400, "Start date cannot be after end date");
        }

        const summaries = await prisma.dailySummary.findMany({
            where: {
                userId: req.user.id,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                date: "asc",
            },
        });

        return res.json(summaries);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    calculateAndSaveSummary,
    getTodaySummary,
    getSummaryByRange,
};
