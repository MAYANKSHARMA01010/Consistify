const prisma = require("../configs/prisma");
const ApiError = require("../utils/ApiError");
const { calculateAndSaveSummary } = require("./summary.service");
const cache = require("../configs/redis");

const CACHE_TTL = 300; // 5 minutes

const invalidateTaskCache = async (userId) => {
    await cache.del(`tasks:list:${userId}`);
};

const createTask = async (userId, data) => {
    const { title, priority, startDate, endDate } = data;

    const existingActiveTask = await prisma.task.findFirst({
        where: {
            userId,
            title: { equals: title.trim(), mode: 'insensitive' },
            isActive: true
        }
    });

    if (existingActiveTask) {
        throw new ApiError(409, "An active task with this title already exists");
    }

    const task = await prisma.task.create({
        data: {
            title: title.trim(),
            priority: priority || "MEDIUM",
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            userId,
        },
    });

    await invalidateTaskCache(userId);
    return task;
};

const getTasks = async (userId) => {
    const cacheKey = `tasks:list:${userId}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) return cachedData;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tasks = await prisma.task.findMany({
        where: {
            userId,
            isActive: true,
        },
        select: {
            id: true,
            title: true,
            priority: true,
            isActive: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            dailyStatus: {
                where: { date: today },
                select: {
                    isCompleted: true,
                    taskTitle: true,
                    taskPriority: true,
                },
                take: 1
            }
        },
        orderBy: { createdAt: "desc" },
    });

    const result = tasks.map(task => {
        const status = task.dailyStatus?.[0];
        return {
            id: task.id,
            title: status?.taskTitle || task.title,
            priority: status?.taskPriority || task.priority,
            isActive: task.isActive,
            startDate: task.startDate,
            endDate: task.endDate,
            createdAt: task.createdAt,
            completed: status?.isCompleted || false,
        };
    });

    await cache.set(cacheKey, result, CACHE_TTL);
    return result;
};

const updateTask = async (userId, taskId, data) => {
    const { title, priority, startDate, endDate } = data;

    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) throw new ApiError(404, "Task not found");
    if (task.userId !== userId) throw new ApiError(403, "Unauthorized");

    if (title && title.trim() !== task.title) {
        const duplicate = await prisma.task.findFirst({
            where: {
                userId,
                title: { equals: title.trim(), mode: 'insensitive' },
                isActive: true,
                id: { not: taskId }
            }
        });
        if (duplicate) throw new ApiError(409, "Another active task with this title already exists");
    }

    const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
            title: title ? title.trim() : undefined,
            priority: priority || undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        },
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await prisma.dailyTaskStatus.updateMany({
        where: { taskId, date: today },
        data: {
            taskTitle: updatedTask.title,
            taskPriority: updatedTask.priority
        }
    });

    await invalidateTaskCache(userId);
    return updatedTask;
};

const deleteTask = async (userId, taskId) => {
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) throw new ApiError(404, "Task not found");
    if (task.userId !== userId) throw new ApiError(403, "Unauthorized");

    await prisma.task.update({
        where: { id: taskId },
        data: { isActive: false },
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    await calculateAndSaveSummary(userId, today);
    await invalidateTaskCache(userId);
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
};
