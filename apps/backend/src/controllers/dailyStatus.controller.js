const prisma = require("../configs/prisma");
const { calculateAndSaveSummary } = require("./summary.controller");
const ApiError = require("../utils/ApiError");

const normalizeDate = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    if (isNaN(date.getTime())) {
        throw new ApiError(400, "Invalid date format");
    }
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

const getDailyStatus = async (req, res, next) => {
    try {
        const { date } = req.query;
        // normalizeDate will throw if date is invalid
        const queryDate = normalizeDate(date);

        const tasks = await prisma.task.findMany({
            where: {
                userId: req.user.id,
                isActive: true,
                startDate: {
                    lte: queryDate,
                },
                OR: [
                    { endDate: null },
                    { endDate: { gte: queryDate } }
                ]
            },
        });

        await Promise.all(
            tasks.map(async (task) => {
                const existing = await prisma.dailyTaskStatus.findUnique({
                    where: {
                        taskId_date: {
                            taskId: task.id,
                            date: queryDate,
                        },
                    },
                });

                if (!existing) {
                    await prisma.dailyTaskStatus.create({
                        data: {
                            userId: req.user.id,
                            taskId: task.id,
                            date: queryDate,
                            isCompleted: false,
                            taskTitle: task.title,
                            taskPriority: task.priority,
                        },
                    });
                }
            })
        );

        const dailyStatuses = await prisma.dailyTaskStatus.findMany({
            where: {
                userId: req.user.id,
                date: queryDate,
            },
            include: {
                task: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.json(dailyStatuses);
    } catch (error) {
        next(error);
    }
};

const updateDailyStatus = async (req, res, next) => {
    try {
        const { taskId, date, isCompleted } = req.body;

        if (!taskId) {
            throw new ApiError(400, "Task ID is required");
        }
        if (!date) {
            throw new ApiError(400, "Date is required");
        }
        if (isCompleted === undefined) {
            throw new ApiError(400, "isCompleted status is required");
        }

        const statusDate = normalizeDate(date);

        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task) {
            throw new ApiError(404, "Task not found");
        }

        if (task.userId !== req.user.id) {
            throw new ApiError(403, "Unauthorized access to task");
        }

        if (!task.isActive) {
            throw new ApiError(400, "Cannot update status for an inactive task");
        }

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
                userId: req.user.id,
                taskId,
                date: statusDate,
                isCompleted,
                taskTitle: task.title,
                taskPriority: task.priority,
            },
        });

        await calculateAndSaveSummary(req.user.id, statusDate);

        return res.json(status);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDailyStatus,
    updateDailyStatus,
};
