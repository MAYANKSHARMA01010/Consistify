import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    NEXT_PUBLIC_FRONTEND_LOCAL_URL: z.string().url(),
    NEXT_PUBLIC_FRONTEND_SERVER_URL: z.string().url(),
    NEXT_PUBLIC_BACKEND_LOCAL_URL: z.string().url(),
    NEXT_PUBLIC_BACKEND_SERVER_URL: z.string().url(),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
});

const parsedEnv = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_FRONTEND_LOCAL_URL: process.env.NEXT_PUBLIC_FRONTEND_LOCAL_URL,
    NEXT_PUBLIC_FRONTEND_SERVER_URL: process.env.NEXT_PUBLIC_FRONTEND_SERVER_URL,
    NEXT_PUBLIC_BACKEND_LOCAL_URL: process.env.NEXT_PUBLIC_BACKEND_LOCAL_URL,
    NEXT_PUBLIC_BACKEND_SERVER_URL: process.env.NEXT_PUBLIC_BACKEND_SERVER_URL,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
});

if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:", parsedEnv.error.format());
    throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
