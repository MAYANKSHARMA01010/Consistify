const prisma = require("../configs/prisma").prisma;

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
        throw error;
    }
};

const getTodaySummary = async (req, res) => {
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
        console.error("Get Today Summary Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getSummaryByRange = async (req, res) => {
    try {
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({ message: "Start and end dates are required" });
        }

        const startDate = new Date(start);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(end);
        endDate.setUTCHours(23, 59, 59, 999);

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
        console.error("Get Range Summary Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    calculateAndSaveSummary,
    getTodaySummary,
    getSummaryByRange,
};
