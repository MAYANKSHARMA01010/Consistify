const prisma = require("../configs/prisma");
const ApiError = require("../utils/ApiError");

const MISSED_DAY_PENALTY = 1;

const getStartOfDayUTC = (dateInput) => {
    const date = new Date(dateInput);
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

const getEndOfDayUTC = (dateInput) => {
    const date = new Date(dateInput);
    date.setUTCHours(23, 59, 59, 999);
    return date;
};

const getYesterdayUTC = (dateInput) => {
    const yesterday = getStartOfDayUTC(dateInput);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return yesterday;
};

const calculateAndSaveSummary = async (userId, date) => {
    try {
        const summaryDate = new Date(date);
        summaryDate.setUTCHours(0, 0, 0, 0);

        const activeTasks = await prisma.task.findMany({
            where: {
                userId,
                isActive: true,
                startDate: { lte: summaryDate },
                OR: [
                    { endDate: null },
                    { endDate: { gte: summaryDate } }
                ]
            }
        });

        await Promise.all(
            activeTasks.map(async (task) => {
                await prisma.dailyTaskStatus.upsert({
                    where: {
                        taskId_date: {
                            taskId: task.id,
                            date: summaryDate,
                        },
                    },
                    update: {}, // Do nothing if it exists
                    create: {
                        userId,
                        taskId: task.id,
                        date: summaryDate,
                        isCompleted: false,
                        taskTitle: task.title,
                        taskPriority: task.priority,
                    },
                });
            })
        );

        const statuses = await prisma.dailyTaskStatus.findMany({
            where: {
                userId,
                date: summaryDate,
                task: {
                    isActive: true
                }
            },
        });

        const totalTasks = statuses.length;
        const completedTasks = statuses.filter((s) => s.isCompleted).length;
        const missedDay = totalTasks > 0 && completedTasks === 0;
        const points = missedDay ? -MISSED_DAY_PENALTY : completedTasks;

        let consistency = 0;
        if (totalTasks > 0) {
            consistency = (completedTasks / totalTasks) * 100;
        }

        const yesterday = getYesterdayUTC(summaryDate);

        const previousSummary = await prisma.dailySummary.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: yesterday,
                },
            },
        });

        const cumulativePoints = (previousSummary?.cumulativePoints || 0) + points;

        let currentStreak = 0;
        if (completedTasks > 0) {
            const lastCompletedSummary = await prisma.dailySummary.findFirst({
                where: {
                    userId,
                    date: { lt: summaryDate },
                    completedTasks: { gt: 0 },
                },
                orderBy: { date: "desc" },
            });

            const lastCompletedDate = lastCompletedSummary ? getStartOfDayUTC(lastCompletedSummary.date) : null;
            const yesterdayDate = getYesterdayUTC(summaryDate);

            if (lastCompletedDate && lastCompletedDate.getTime() === yesterdayDate.getTime()) {
                currentStreak = (lastCompletedSummary.currentStreak || 0) + 1;
            } else {
                currentStreak = 1;
            }
        }

        // Calculate max streak by checking all-time best
        const bestPastSummary = await prisma.dailySummary.findFirst({
            where: {
                userId,
                date: { lt: summaryDate }
            },
            orderBy: {
                currentStreak: 'desc'
            }
        });

        const bestPastStreak = bestPastSummary?.currentStreak || 0;
        const maxStreak = Math.max(currentStreak, bestPastStreak, previousSummary?.maxStreak || 0);

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
                cumulativePoints,
                consistency,
                currentStreak,
                maxStreak,
            },
            create: {
                userId,
                date: summaryDate,
                totalTasks,
                completedTasks,
                points,
                cumulativePoints,
                consistency,
                currentStreak,
                maxStreak,
            },
        });

        await prisma.taskAuditLog.deleteMany({
            where: { summaryId: summary.id }
        });

        if (statuses.length > 0) {
            await prisma.taskAuditLog.createMany({
                data: statuses.map(s => ({
                    summaryId: summary.id,
                    taskId: s.taskId,
                    title: s.taskTitle || "Untitled Task",
                    priority: s.taskPriority || "MEDIUM",
                    completed: s.isCompleted
                }))
            });
        }

        return summary;
    } catch (error) {
        console.error("Calculate Summary Error:", error);
        throw new ApiError(500, "Failed to calculate summary");
    }
};



const calculateWeeklyPoints = async (userId) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await prisma.dailySummary.aggregate({
        where: {
            userId,
            date: {
                gte: sevenDaysAgo,
            },
        },
        _sum: {
            points: true,
        },
    });

    return result._sum.points || 0;
};


const getTodaySummary = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        await calculateAndSaveSummary(userId, today);

        const summary = await prisma.dailySummary.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: today,
                },
            },
        });

        const pendingTasks = await prisma.task.count({
            where: {
                userId: req.user.id,
                isActive: true,
                NOT: {
                    dailyStatus: {
                        some: {
                            date: today,
                            isCompleted: true,
                        },
                    },
                },
            },
        });

        const pointsLastWeek = await calculateWeeklyPoints(req.user.id);

        const completedToday = summary?.completedTasks || 0;
        const pointsToday = summary?.points || 0;

        // Calculate display streak
        let displayStreak = summary?.currentStreak || 0;
        if (completedToday === 0) {
            const yesterday = getYesterdayUTC(today);
            const previousSummary = await prisma.dailySummary.findUnique({
                where: {
                    userId_date: {
                        userId,
                        date: yesterday,
                    },
                },
            });
            displayStreak = previousSummary?.currentStreak || 0;
        }

        return res.json({
            completedToday,
            pendingTasks,
            streak: displayStreak,
            maxStreak: summary?.maxStreak || 0,
            pointsToday,
            pointsLastWeek,
            consistency: summary?.consistency || 0,
            focus: summary?.focus || null,
            mood: summary?.mood || null,
            notes: summary?.notes || null,
            totalTasks: summary?.totalTasks || 0,
            missedDayPenalty: MISSED_DAY_PENALTY,
        });
    } catch (error) {
        next(error);
    }
};

const getWeeklyReport = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const end = getEndOfDayUTC(new Date());
        const start = getStartOfDayUTC(new Date());
        start.setUTCDate(start.getUTCDate() - 6);

        const summaries = await prisma.dailySummary.findMany({
            where: {
                userId,
                date: {
                    gte: start,
                    lte: end,
                },
            },
            orderBy: {
                date: "asc",
            },
        });

        const chart = [];
        for (let i = 0; i < 7; i++) {
            const day = getStartOfDayUTC(start);
            day.setUTCDate(start.getUTCDate() + i);
            const iso = day.toISOString().split("T")[0];

            const found = summaries.find((summary) => summary.date.toISOString().split("T")[0] === iso);
            chart.push({
                date: iso,
                points: found?.points || 0,
                consistency: found?.consistency || 0,
                completedTasks: found?.completedTasks || 0,
                totalTasks: found?.totalTasks || 0,
                streak: found?.currentStreak || 0,
                missedDay: Boolean(found && found.totalTasks > 0 && found.completedTasks === 0),
            });
        }

        const validConsistencyDays = chart.filter((day) => day.totalTasks > 0);
        const avgConsistency = validConsistencyDays.length
            ? validConsistencyDays.reduce((acc, day) => acc + day.consistency, 0) / validConsistencyDays.length
            : 0;

        const totalPoints = chart.reduce((acc, day) => acc + day.points, 0);
        const missedDays = chart.filter((day) => day.missedDay).length;
        const totalCompletedTasks = chart.reduce((acc, day) => acc + day.completedTasks, 0);
        const totalPlannedTasks = chart.reduce((acc, day) => acc + day.totalTasks, 0);
        const completionRate = totalPlannedTasks > 0 ? (totalCompletedTasks / totalPlannedTasks) * 100 : 0;
        const productivityScoreRaw = (avgConsistency * 0.6) + (completionRate * 0.4) - (missedDays * 10);
        const productivityScore = Math.max(0, Math.min(100, Number(productivityScoreRaw.toFixed(2))));

        return res.json({
            range: {
                start: start.toISOString().split("T")[0],
                end: end.toISOString().split("T")[0],
            },
            summary: {
                totalPoints,
                missedDays,
                avgConsistency: Number(avgConsistency.toFixed(2)),
                currentStreak: chart[chart.length - 1]?.streak || 0,
                maxStreakInWeek: Math.max(...chart.map((d) => d.streak), 0),
                productivityScore,
            },
            chart,
        });
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
        if (Number.isNaN(startDate.getTime())) {
            throw new ApiError(400, "Invalid start date");
        }
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(end);
        if (Number.isNaN(endDate.getTime())) {
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

const updateSummary = async (req, res, next) => {
    try {
        const { focus, mood, notes, date } = req.body;

        let summaryDate = new Date();
        if (date) {
            summaryDate = new Date(date);
        }
        summaryDate.setUTCHours(0, 0, 0, 0);

        const summary = await prisma.dailySummary.upsert({
            where: {
                userId_date: {
                    userId: req.user.id,
                    date: summaryDate,
                },
            },
            update: {
                focus,
                mood,
                notes,
            },
            create: {
                userId: req.user.id,
                date: summaryDate,
                focus,
                mood,
                notes,
                completedTasks: 0,
                totalTasks: 0,
                points: 0,
                cumulativePoints: 0,
                consistency: 0,
            },
        });

        return res.json(summary);
    } catch (error) {
        next(error);
    }
};

const getSummaryDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        const summary = await prisma.dailySummary.findUnique({
            where: { id },
            include: {
                auditLogs: true
            }
        });

        if (!summary) {
            throw new ApiError(404, "Summary not found");
        }

        if (summary.userId !== req.user.id) {
            throw new ApiError(403, "Unauthorized");
        }

        const tasks = summary.auditLogs.map(log => ({
            id: log.id,
            taskId: log.taskId,
            title: log.title,
            priority: log.priority,
            isCompleted: log.completed
        }));

        return res.json(tasks);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    calculateAndSaveSummary,
    getTodaySummary,
    getWeeklyReport,
    getSummaryByRange,
    updateSummary,
    getSummaryDetails,
};
