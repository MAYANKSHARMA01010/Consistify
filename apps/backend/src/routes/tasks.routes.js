const express = require("express");
const {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
} = require("../controllers/tasks.controller");

const { requireAuth } = require("../middlewares/auth.middleware");
const rateLimit = require("express-rate-limit");
const validateRequest = require("../middlewares/validateRequest.middleware");
const { createTaskSchema, updateTaskSchema } = require("../validators/tasks.validators");

const tasksRouter = express.Router();

const tasksRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs for task routes
});

tasksRouter.use(tasksRateLimiter);
tasksRouter.use(requireAuth);

tasksRouter.post("/", validateRequest(createTaskSchema), createTask);
tasksRouter.get("/", getTasks);
tasksRouter.put("/:id", validateRequest(updateTaskSchema), updateTask);
tasksRouter.delete("/:id", deleteTask);

module.exports = tasksRouter;
