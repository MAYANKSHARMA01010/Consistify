const { z } = require("zod");
require("dotenv").config();

const envSchema = z.object({
    SERVER_PORT: z.string().default("5001"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    FRONTEND_LOCAL_URL: z.string().url(),
    FRONTEND_SERVER_URL: z.string().url(),
    BACKEND_LOCAL_URL: z.string().url(),
    BACKEND_SERVER_URL: z.string().url(),
    DATABASE_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string().min(1, "Google Client ID is required"),
    GOOGLE_CLIENT_SECRET: z.string().min(1, "Google Client Secret is required"),
    ACCESS_TOKEN_EXPIRY: z.string().default("15m"),
    JWT_ACCESS_SECRET: z.string().min(1, "JWT Access Secret is required"),
    REFRESH_TOKEN_EXPIRY: z.string().default("7d"),
    JWT_REFRESH_SECRET: z.string().min(1, "JWT Refresh Secret is required"),
    CONTACT_EMAIL_USER: z.string().email(),
    CONTACT_EMAIL_PASS: z.string().min(1, "Email password is required"),
    CONTACT_RECIPIENT_EMAIL: z.string().email(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:", parsedEnv.error.format());
    process.exit(1);
}

module.exports = {
    env: parsedEnv.data,
};
