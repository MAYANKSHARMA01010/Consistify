const prisma = require("../configs/prisma").prisma;

const createTask = async (req, res) => {
    try {
        const { title, startDate, endDate } = req.body;

        if (!title || !startDate) {
            return res.status(400).json({ message: "Title and Start Date are required" });
        }

        const task = await prisma.task.create({
            data: {
                title,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                userId: req.user.id,
            },
        });

        return res.status(201).json(task);
    } catch (error) {
        console.error("Create Task Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getTasks = async (req, res) => {
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
        console.error("Get Tasks Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, startDate, endDate } = req.body;

        const task = await prisma.task.findUnique({
            where: { id },
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (task.userId !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                title,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            },
        });

        return res.json(updatedTask);
    } catch (error) {
        console.error("Update Task Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await prisma.task.findUnique({
            where: { id },
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (task.userId !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Soft delete
        await prisma.task.update({
            where: { id },
            data: { isActive: false },
        });

        return res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Delete Task Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
};
