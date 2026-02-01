const express = require("express");
const {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
} = require("../controllers/tasks.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const tasksRouter = express.Router();

tasksRouter.use(requireAuth);

tasksRouter.post("/", createTask);
tasksRouter.get("/", getTasks);
tasksRouter.put("/:id", updateTask);
tasksRouter.delete("/:id", deleteTask);

module.exports = tasksRouter;
