const { z } = require("zod");

const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    startDate: z.string().min(1, "Start Date is required"),
    endDate: z.string().optional().nullable(),
});

const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
});

module.exports = {
    createTaskSchema,
    updateTaskSchema,
};
