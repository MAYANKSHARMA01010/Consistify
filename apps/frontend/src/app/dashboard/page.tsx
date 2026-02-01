"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [loading, user]);

    if (loading) return <p>Loading...</p>;
    if (!user) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">
                Welcome back, {user.name} 👋
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Today's Points" value="—" />
                <StatCard title="Current Streak" value="—" />
                <StatCard title="Consistency %" value="—" />
            </div>

            <div className="border rounded p-6">
                <h2 className="text-lg font-semibold mb-2">
                    Productivity Overview
                </h2>
                <p className="text-gray-500">
                    Charts will be added here.
                </p>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
}: {
    title: string;
    value: string;
}) {
    return (
        <div className="border rounded p-4">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}
