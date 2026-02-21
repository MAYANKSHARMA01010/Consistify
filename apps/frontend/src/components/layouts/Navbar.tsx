"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { usePathname } from "next/navigation";
import { NeonButton } from "../ui/NeonButton";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/utils/cn";

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);

    const navLinks = [
        { name: "Dashboard", href: "/dashboard" },
        { name: "History", href: "/history" },
        { name: "Settings", href: "/settings" },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/50 backdrop-blur-md"
        >
            <div className="flex items-center gap-8">
                <Link href="/" className="group relative">
                    <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 group-hover:opacity-80 transition-opacity">
                        CONSISTIFY
                    </span>
                    <motion.div
                        className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 group-hover:w-full transition-all duration-300"
                    />
                </Link>

                {user && (
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onMouseEnter={() => setHoveredLink(link.href)}
                                onMouseLeave={() => setHoveredLink(null)}
                                className={cn(
                                    "relative px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                                    pathname === link.href ? "text-white" : "text-zinc-400 hover:text-white"
                                )}
                            >
                                {link.name}
                                {pathname === link.href && (
                                    <motion.div
                                        layoutId="navbar-active"
                                        className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                {hoveredLink === link.href && pathname !== link.href && (
                                    <motion.div
                                        layoutId="navbar-hover"
                                        className="absolute inset-0 bg-white/5 rounded-lg -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                                {user.name}
                            </span>
                            <span className="text-[10px] text-cyan-400 font-mono">
                                Level {Math.floor((user.xp || 0) / 100) + 1}
                            </span>
                        </div>
                        <NeonButton
                            onClick={logout}
                            variant="secondary"
                            className="px-4 py-2 text-xs"
                        >
                            Logout
                        </NeonButton>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                            Login
                        </Link>
                        <NeonButton href="/register" variant="primary" className="px-5 py-2 text-xs">
                            Get Started
                        </NeonButton>
                    </div>
                )}
            </div>
        </motion.nav>
    );
}
