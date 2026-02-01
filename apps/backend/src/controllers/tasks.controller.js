const prisma = require("../configs/prisma");
const ApiError = require("../utils/ApiError");

const createTask = async (req, res, next) => {
    try {
        const { title, startDate, endDate } = req.body;

        if (!title || typeof title !== 'string' || !title.trim()) {
            throw new ApiError(400, "Title is required");
        }
        if (!startDate) {
            throw new ApiError(400, "Start Date is required");
        }

        const existingActiveTask = await prisma.task.findFirst({
            where: {
                userId: req.user.id,
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
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                userId: req.user.id,
            },
        });

        return res.status(201).json(task);
    } catch (error) {
        next(error);
    }
};

const getTasks = async (req, res, next) => {
    try {
        const tasks = await prisma.task.findMany({
            where: {
                userId: req.user.id,
                isActive: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.json(tasks);
    } catch (error) {
        next(error);
    }
};

const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, startDate, endDate } = req.body;

        const task = await prisma.task.findUnique({
            where: { id },
        });

        if (!task) {
            throw new ApiError(404, "Task not found");
        }

        if (task.userId !== req.user.id) {
            throw new ApiError(403, "Unauthorized");
        }

        if (title && title.trim() !== task.title) {
            const duplicate = await prisma.task.findFirst({
                where: {
                    userId: req.user.id,
                    title: { equals: title.trim(), mode: 'insensitive' },
                    isActive: true,
                    id: { not: id }
                }
            });
            if (duplicate) {
                throw new ApiError(409, "Another active task with this title already exists");
            }
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                title: title ? title.trim() : undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            },
        });

        return res.json(updatedTask);
    } catch (error) {
        next(error);
    }
};

const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        const task = await prisma.task.findUnique({
            where: { id },
        });

        if (!task) {
            throw new ApiError(404, "Task not found");
        }

        if (task.userId !== req.user.id) {
            throw new ApiError(403, "Unauthorized");
        }

        await prisma.task.update({
            where: { id },
            data: { isActive: false },
        });

        return res.json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
};
