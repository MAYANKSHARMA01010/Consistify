"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="flex items-center justify-between px-6 py-4 border-b">
            <Link href="/" className="text-xl font-bold">
                Consistify
            </Link>

            <div className="flex items-center gap-6">
                {user ? (
                    <>
                        <Link href="/dashboard">Dashboard</Link>
                        <Link href="/tasks">Tasks</Link>
                        <Link href="/today">Today</Link>
                        <Link href="/analytics">Analytics</Link>

                        <button
                            onClick={logout}
                            className="px-4 py-1 border rounded hover:bg-gray-100"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login">Login</Link>
                        <Link href="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
