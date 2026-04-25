const { z } = require("zod");

const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

const requestEmailVerificationSchema = z.object({
    email: z.string().email("Invalid email format"),
});

const verifyEmailSchema = z.object({
    token: z.string().min(1, "Verification token is required"),
});

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email format"),
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

module.exports = {
    registerSchema,
    loginSchema,
    requestEmailVerificationSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
};
