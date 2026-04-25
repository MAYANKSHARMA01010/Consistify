const tasksService = require("../services/tasks.service");

const createTask = async (req, res, next) => {
    try {
        const task = await tasksService.createTask(req.user.id, req.body);
        return res.status(201).json(task);
    } catch (error) {
        next(error);
    }
};

const getTasks = async (req, res, next) => {
    try {
        const tasks = await tasksService.getTasks(req.user.id);
        return res.json(tasks);
    } catch (error) {
        next(error);
    }
};

const updateTask = async (req, res, next) => {
    try {
        const updatedTask = await tasksService.updateTask(req.user.id, req.params.id, req.body);
        return res.json(updatedTask);
    } catch (error) {
        next(error);
    }
};

const deleteTask = async (req, res, next) => {
    try {
        await tasksService.deleteTask(req.user.id, req.params.id);
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
