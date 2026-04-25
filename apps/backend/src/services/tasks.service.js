const prisma = require("../configs/prisma");
const ApiError = require("../utils/ApiError");
const { calculateAndSaveSummary } = require("./summary.service");

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

    return task;
};

const getTasks = async (userId) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tasks = await prisma.task.findMany({
        where: {
            userId,
            isActive: true,
        },
        include: {
            dailyStatus: {
                where: { date: today },
                select: {
                    isCompleted: true,
                    taskTitle: true,
                    taskPriority: true,
                }
            }
        },
        orderBy: { createdAt: "desc" },
    });

    return tasks.map(task => {
        const status = task.dailyStatus?.[0];
        return {
            ...task,
            completed: status?.isCompleted || false,
            taskTitle: status?.taskTitle || task.title,
            taskPriority: status?.taskPriority || task.priority,
            dailyStatus: undefined
        };
    });
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
    
    // We import calculateAndSaveSummary dynamically to avoid circular dependencies if any,
    // though since it's a service we can import it statically at the top.
    await calculateAndSaveSummary(userId, today);
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
};
