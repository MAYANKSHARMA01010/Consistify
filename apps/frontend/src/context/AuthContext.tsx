"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type User = {
    id: string;
    name: string;
    email: string;
    username: string;
    role: "USER" | "ADMIN";
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    isLoggedIn: boolean;
    refreshUser: () => Promise<void>;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const refreshUser = async () => {
        try {
            const me = await apiFetch<User>("/api/auth/me");
            setUser(me);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (data: any) => {
        await apiFetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        });
        await refreshUser();
        if (user) {
            router.push("/dashboard");
        }
    };

    const register = async (data: any) => {
        await apiFetch("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        });
        await refreshUser();
        if (user) {
            router.push("/dashboard");
        }
    };

    const logout = async () => {
        try {
            await apiFetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
            console.error("Logout failed", error);
        }
        setUser(null);
        router.push("/login");
        toast.success("Logged out successfully!");
    };

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, loading, refreshUser, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
