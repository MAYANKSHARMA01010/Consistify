export interface ApiRequestOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
}

export type AuthRegisterPayload = {
    name: string;
    username: string;
    email: string;
    password: string;
};

export type AuthLoginPayload = {
    email: string;
    password: string;
};
