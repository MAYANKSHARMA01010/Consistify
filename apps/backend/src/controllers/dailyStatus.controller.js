const prisma = require("../configs/prisma").prisma;
const { calculateAndSaveSummary } = require("./summary.controller");

const normalizeDate = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

const getDailyStatus = async (req, res) => {
    try {
        const { date } = req.query;
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
                        },
                    });
                }
            })
        );

        const dailyStatuses = await prisma.dailyTaskStatus.findMany({
            where: {
                userId: req.user.id,
                date: queryDate,
                task: {
                    isActive: true,
                }
            },
            include: {
                task: true,
            },
            orderBy: {
                task: {
                    createdAt: "desc",
                },
            },
        });

        return res.json(dailyStatuses);
    } catch (error) {
        console.error("Get Daily Status Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const updateDailyStatus = async (req, res) => {
    try {
        const { taskId, date, isCompleted } = req.body;

        if (!taskId || !date || isCompleted === undefined) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const statusDate = normalizeDate(date);

        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task || task.userId !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized access to task" });
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
            },
        });

        await calculateAndSaveSummary(req.user.id, statusDate);

        return res.json(status);
    } catch (error) {
        console.error("Update Daily Status Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getDailyStatus,
    updateDailyStatus,
};
