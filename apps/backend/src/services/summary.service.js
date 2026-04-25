const prisma = require("../configs/prisma");
const ApiError = require("../utils/ApiError");
const cache = require("../configs/redis");

const CACHE_TTL = 300; // 5 minutes

const invalidateUserCache = async (userId) => {
    await cache.del(`summary:today:${userId}`);
    await cache.del(`summary:weekly:${userId}`);
    // Note: Range cache is harder to invalidate specifically, but today/weekly are the most frequent.
    // For simplicity, we can let range cache expire or use a versioning scheme if needed.
};

const calculateAndSaveSummary = async (userId, targetDate) => {
    try {
        const summaryDate = new Date(targetDate);
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
                    update: {}, 
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
        
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const isToday = summaryDate.getTime() === today.getTime();
        
        const missedDay = totalTasks > 0 && completedTasks === 0;
        const points = (missedDay && !isToday) ? -MISSED_DAY_PENALTY : completedTasks;

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
            const lastCompletedSummary = await prisma.dailySummary.findFirst({
                where: {
                    userId,
                    date: { lt: summaryDate },
                    completedTasks: { gt: 0 },
                },
                orderBy: { date: "desc" },
            });

            const lastCompletedDate = lastCompletedSummary ? new Date(lastCompletedSummary.date) : null;
            if (lastCompletedDate) lastCompletedDate.setUTCHours(0,0,0,0);

            if (lastCompletedDate && lastCompletedDate.getTime() === yesterday.getTime()) {
                currentStreak = (lastCompletedSummary.currentStreak || 0) + 1;
            } else {
                currentStreak = 1;
            }
        }

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

        // Invalidate cache since data changed
        await invalidateUserCache(userId);

        return summary;
    } catch (error) {
        console.error("Calculate Summary Error:", error);
        throw new ApiError(500, "Failed to calculate summary");
    }
};

const MISSED_DAY_PENALTY = 1;

const calculateWeeklyPoints = async (userId) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await prisma.dailySummary.aggregate({
        where: { userId, date: { gte: sevenDaysAgo } },
        _sum: { points: true },
    });

    return result._sum.points || 0;
};

const getTodaySummary = async (userId) => {
    const cacheKey = `summary:today:${userId}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) return cachedData;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await calculateAndSaveSummary(userId, today);

    const summary = await prisma.dailySummary.findUnique({
        where: { userId_date: { userId, date: today } },
        select: {
            completedTasks: true,
            totalTasks: true,
            points: true,
            consistency: true,
            focus: true,
            mood: true,
            notes: true,
            currentStreak: true,
            maxStreak: true,
        }
    });

    const pendingTasks = await prisma.task.count({
        where: {
            userId,
            isActive: true,
            NOT: {
                dailyStatus: {
                    some: { date: today, isCompleted: true },
                },
            },
        },
    });

    const pointsLastWeek = await calculateWeeklyPoints(userId);

    const completedToday = summary?.completedTasks || 0;
    const pointsToday = summary?.points || 0;

    let displayStreak = summary?.currentStreak || 0;
    if (completedToday === 0) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const previousSummary = await prisma.dailySummary.findUnique({
            where: { userId_date: { userId, date: yesterday } },
            select: { currentStreak: true }
        });
        displayStreak = previousSummary?.currentStreak || 0;
    }

    const result = {
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
    };

    await cache.set(cacheKey, result, CACHE_TTL);
    return result;
};

const updateSummary = async (userId, data) => {
    const { focus, mood, notes, date } = data;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setUTCHours(0, 0, 0, 0);

    const existingSummary = await prisma.dailySummary.findUnique({
        where: { userId_date: { userId, date: targetDate } }
    });

    if (!existingSummary) {
        throw new ApiError(404, "No summary found for this date. Create a task first to initialize tracking.");
    }

    const updated = await prisma.dailySummary.update({
        where: { userId_date: { userId, date: targetDate } },
        data: {
            focus: focus !== undefined ? focus : existingSummary.focus,
            mood: mood !== undefined ? mood : existingSummary.mood,
            notes: notes !== undefined ? notes : existingSummary.notes,
        }
    });

    await invalidateUserCache(userId);
    return updated;
};

const getSummaryByRange = async (userId, startDateStr, endDateStr) => {
    const cacheKey = `summary:range:${userId}:${startDateStr}:${endDateStr}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) return cachedData;

    const startDate = new Date(startDateStr);
    startDate.setUTCHours(0, 0, 0, 0);
    
    const endDate = new Date(endDateStr);
    endDate.setUTCHours(23, 59, 59, 999);

    const result = await prisma.dailySummary.findMany({
        where: {
            userId,
            date: { gte: startDate, lte: endDate }
        },
        select: {
            date: true,
            completedTasks: true,
            totalTasks: true,
            points: true,
            consistency: true,
            focus: true,
            mood: true,
            notes: true,
            currentStreak: true,
        },
        orderBy: { date: 'asc' }
    });

    await cache.set(cacheKey, result, CACHE_TTL);
    return result;
};

const getWeeklyReport = async (userId) => {
    const cacheKey = `summary:weekly:${userId}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) return cachedData;

    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);
    
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - 6);

    const summaries = await prisma.dailySummary.findMany({
        where: {
            userId,
            date: { gte: start, lte: end }
        },
        select: {
            date: true,
            points: true,
            consistency: true,
            completedTasks: true,
            totalTasks: true,
            currentStreak: true,
        },
        orderBy: { date: 'asc' }
    });

    const chart = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setUTCDate(start.getUTCDate() + i);
        day.setUTCHours(0, 0, 0, 0);
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

    const result = {
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
    };

    await cache.set(cacheKey, result, CACHE_TTL);
    return result;
};

const getSummaryDetails = async (userId, id) => {
    const summary = await prisma.dailySummary.findUnique({
        where: { id }
    });

    if (!summary || summary.userId !== userId) {
        throw new ApiError(404, "Summary not found");
    }

    return await prisma.dailyTaskStatus.findMany({
        where: {
            userId,
            date: summary.date
        },
        select: {
            id: true,
            taskId: true,
            taskTitle: true,
            taskPriority: true,
            isCompleted: true,
        }
    });
};

module.exports = {
    calculateAndSaveSummary,
    getTodaySummary,
    updateSummary,
    getSummaryByRange,
    getWeeklyReport,
    getSummaryDetails,
};
