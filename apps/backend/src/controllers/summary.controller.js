const prisma = require("../configs/prisma");
const ApiError = require("../utils/ApiError");

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
                const existing = await prisma.dailyTaskStatus.findUnique({
                    where: {
                        taskId_date: {
                            taskId: task.id,
                            date: summaryDate,
                        },
                    },
                });

                if (!existing) {
                    await prisma.dailyTaskStatus.create({
                        data: {
                            userId,
                            taskId: task.id,
                            date: summaryDate,
                            isCompleted: false,
                            taskTitle: task.title,
                            taskPriority: task.priority,
                        },
                    });
                }
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
        const points = completedTasks;

        let consistency = 0;
        if (totalTasks > 0) {
            consistency = (completedTasks / totalTasks) * 100;
        }

        const yesterday = new Date(summaryDate);
        yesterday.setDate(yesterday.getDate() - 1);

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
            currentStreak = (previousSummary?.currentStreak || 0) + 1;
        } else {
            // Streak broken for this specific day record if 0 tasks done
            // However, UI might show previous streak if today is just starting
            currentStreak = 0;
        }

        const maxStreak = Math.max(currentStreak, previousSummary?.maxStreak || 0);

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
            // If no tasks done today yet, show yesterday's streak (pending)
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
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
    getSummaryByRange,
    updateSummary,
    getSummaryDetails,
};
