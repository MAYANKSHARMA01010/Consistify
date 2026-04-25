import axios from "axios";
import { env } from "@/env";

const isProd = env.NODE_ENV === "production";

const API_BASE = isProd
    ? env.NEXT_PUBLIC_BACKEND_SERVER_URL
    : env.NEXT_PUBLIC_BACKEND_LOCAL_URL;

if (!API_BASE) {
    throw new Error("API base URL is not defined");
}

export const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

export class ApiClientError extends Error {
    status?: number;
    data?: unknown;

    constructor(message: string, status?: number, data?: unknown) {
        super(message);
        this.name = "ApiClientError";
        this.status = status;
        this.data = data;
    }
}

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !error.config.url?.includes("/refresh") && !error.config.url?.includes("/login")) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = api
                    .post("/api/auth/refresh")
                    .then(() => { })
                    .finally(() => {
                        isRefreshing = false;
                        refreshPromise = null;
                    });
            }

            try {
                if (refreshPromise) {
                    await refreshPromise;
                }
                return api(originalRequest);
            } catch {
                return Promise.reject(new Error("Session expired"));
            }
        }

        return Promise.reject(error);
    }
);

import { ApiRequestOptions } from "@/types/api";

export const apiFetch = async <T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> => {
    const { method = "GET", headers = {}, body } = options;

    try {
        const response = await api.request<T>({
            url: endpoint,
            method,
            headers: headers,
            data: body,
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const message = error.response?.data?.message || error.response?.data?.error || error.message || "Something went wrong";
            throw new ApiClientError(message, status, error.response?.data);
        }
        throw error;
    }
};

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof ApiClientError) {
        return error.message;
    }

    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.response?.data?.error || error.message;
    }
    return error instanceof Error ? error.message : "Something went wrong";
};
