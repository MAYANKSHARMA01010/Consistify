"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { NeonButton } from "../ui/NeonButton";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    // Hide navbar on login/register pages if desired, or keep it.
    // For now we keep it but style it.

    const navLinks = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/tasks", label: "Tasks" },
        { href: "/today", label: "Today" },
        { href: "/analytics", label: "Analytics" },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/50 backdrop-blur-md"
        >
            <Link href="/" className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 hover:opacity-80 transition-opacity">
                CONSISTIFY
            </Link>

            <div className="flex items-center gap-8">
                {user ? (
                    <>
                        <div className="hidden md:flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-cyan-300",
                                        pathname === link.href ? "text-cyan-400" : "text-zinc-400"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-xs text-zinc-500 hidden sm:block">
                                {user.email}
                            </span>
                            <button
                                onClick={logout}
                                className="text-sm text-zinc-400 hover:text-white transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                            Login
                        </Link>
                        <NeonButton href="/register" variant="primary" className="px-6 py-2 text-xs">
                            Get Started
                        </NeonButton>
                    </div>
                )}
            </div>
        </motion.nav>
    );
}
