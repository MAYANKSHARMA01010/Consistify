const prisma = require("../configs/prisma");
const ApiError = require("../utils/ApiError");
const summaryService = require("./summary.service");

const normalizeDate = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    if (Number.isNaN(date.getTime())) {
        throw new ApiError(400, "Invalid date format");
    }
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

const getDailyStatus = async (userId, dateStr) => {
    const queryDate = normalizeDate(dateStr);

    const tasks = await prisma.task.findMany({
        where: {
            userId,
            isActive: true,
            startDate: { lte: queryDate },
            OR: [
                { endDate: null },
                { endDate: { gte: queryDate } }
            ]
        },
    });

    await Promise.all(
        tasks.map(async (task) => {
            await prisma.dailyTaskStatus.upsert({
                where: {
                    taskId_date: {
                        taskId: task.id,
                        date: queryDate,
                    },
                },
                update: {}, // Do nothing if it exists
                create: {
                    userId,
                    taskId: task.id,
                    date: queryDate,
                    isCompleted: false,
                    taskTitle: task.title,
                    taskPriority: task.priority,
                },
            });
        })
    );

    const dailyStatuses = await prisma.dailyTaskStatus.findMany({
        where: {
            userId,
            date: queryDate,
        },
        include: {
            task: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return dailyStatuses;
};

const updateDailyStatus = async (userId, data) => {
    const { taskId, date, isCompleted } = data;

    if (!taskId) throw new ApiError(400, "Task ID is required");
    if (!date) throw new ApiError(400, "Date is required");
    if (isCompleted === undefined) throw new ApiError(400, "isCompleted status is required");

    const statusDate = normalizeDate(date);

    const task = await prisma.task.findUnique({
        where: { id: taskId },
    });

    if (!task) throw new ApiError(404, "Task not found");
    if (task.userId !== userId) throw new ApiError(403, "Unauthorized access to task");
    if (!task.isActive) throw new ApiError(400, "Cannot update status for an inactive task");

    const status = await prisma.dailyTaskStatus.upsert({
        where: {
            taskId_date: {
                taskId,
                date: statusDate,
            },
        },
        update: {
            isCompleted,
        },
        create: {
            userId,
            taskId,
            date: statusDate,
            isCompleted,
            taskTitle: task.title,
            taskPriority: task.priority,
        },
    });

    await summaryService.calculateAndSaveSummary(userId, statusDate);

    return status;
};

module.exports = {
    getDailyStatus,
    updateDailyStatus,
};
