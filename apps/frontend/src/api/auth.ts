import { apiFetch } from "./client";
import { AuthRegisterPayload, AuthLoginPayload } from "@/types/api";

export const authApi = {
    register: (data: AuthRegisterPayload) => apiFetch<{ success: boolean; message: string }>("/api/auth/register", { method: "POST", body: data }),
    login: (data: AuthLoginPayload) => apiFetch<{ success: boolean; message: string }>("/api/auth/login", { method: "POST", body: data }),
    logout: () => apiFetch<void>("/api/auth/logout", { method: "POST" }),
    getMe: () => apiFetch<unknown>("/api/auth/me"),
    dismissBanner: () => apiFetch<{ success: boolean; message: string }>("/api/auth/dismiss-banner", { method: "POST" }),
    refreshToken: () => apiFetch<void>("/api/auth/refresh", { method: "POST" }),
    requestEmailVerification: (email: string) =>
        apiFetch<{ success: boolean; message: string; verifyToken?: string }>("/api/auth/verify-email/request", {
            method: "POST",
            body: { email },
        }),
    verifyEmail: (token: string) =>
        apiFetch<{ success: boolean; message: string }>("/api/auth/verify-email", {
            method: "POST",
            body: { token },
        }),
    forgotPassword: (email: string) =>
        apiFetch<{ success: boolean; message: string; resetToken?: string }>("/api/auth/forgot-password", {
            method: "POST",
            body: { email },
        }),
    resetPassword: (token: string, password: string) =>
        apiFetch<{ success: boolean; message: string }>("/api/auth/reset-password", {
            method: "POST",
            body: { token, password },
        }),
};
