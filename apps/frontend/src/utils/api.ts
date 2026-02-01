import axios from "axios";

const isProd = process.env.NODE_ENV === "production";

const API_BASE = isProd
    ? process.env.NEXT_PUBLIC_BACKEND_SERVER_URL
    : process.env.NEXT_PUBLIC_BACKEND_LOCAL_URL;

if (!API_BASE) {
    throw new Error("API base URL is not defined");
}

export const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !error.config.url?.includes("/refresh")) {
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

export const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const { method = "GET", headers = {}, body } = options;

    const response = await api.request<T>({
        url: endpoint,
        method,
        headers: headers as any,
        data: body,
    });

    return response.data;
};
