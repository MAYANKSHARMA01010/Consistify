"use client";

import { useAuth } from "../context/AuthContext";
import { NeonButton } from "@/components/ui/NeonButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { Skeleton } from "boneyard-js/react";

const features = [
    {
        title: "Daily Tracking",
        text: "Log tasks in seconds and build momentum with clear completion progress.",
        icon: "✓",
    },
    {
        title: "Consistency Engine",
        text: "Smart streak logic, missed-day penalty, and weekly reports that keep you accountable.",
        icon: "🔥",
    },
    {
        title: "Actionable Analytics",
        text: "Use trends, weekly charts, and status insights to improve how you work every day.",
        icon: "📊",
    },
];

export default function LandingPageClient() {
    const { isLoggedIn, loading } = useAuth();

    if (loading) {
        return <SplashScreen message="Waking up server" />;
    }

    return (
        <div className="relative z-10 min-h-screen overflow-hidden px-6 pb-20 pt-28">
            <main className="mx-auto max-w-6xl space-y-16">
                <section className="text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="bg-linear-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-5xl font-black tracking-tight text-transparent md:text-7xl"
                    >
                        Build Consistency That Lasts
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                        className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-zinc-300 md:text-xl"
                    >
                        Consistify helps you turn daily actions into long-term results with streak intelligence,
                        weekly reports, and focused execution.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
                    >
                        <NeonButton href={isLoggedIn ? "/dashboard" : "/register"} variant="primary">
                            {isLoggedIn ? "Go to Dashboard" : "Sign up free"}
                        </NeonButton>
                        {!isLoggedIn && (
                            <NeonButton href="/login" variant="outline">
                                Log in
                            </NeonButton>
                        )}
                    </motion.div>
                </section>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.15 + index * 0.08 }}
                        >
                            <GlassCard className="h-full p-6">
                                <div className="mb-4 text-2xl">{feature.icon}</div>
                                <h2 className="text-xl font-bold text-white">{feature.title}</h2>
                                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{feature.text}</p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </section>

                <section className="rounded-3xl border border-cyan-400/20 bg-cyan-500/5 p-8 text-center">
                    <h3 className="text-2xl font-black text-white md:text-3xl">Start your first streak today</h3>
                    <p className="mx-auto mt-3 max-w-2xl text-zinc-300">
                        Join now and get a focused dashboard with streak tracking, missed-day awareness, and weekly progress insights.
                    </p>
                    <div className="mt-6">
                        <NeonButton href={isLoggedIn ? "/dashboard" : "/register"} variant="primary">
                            {isLoggedIn ? "Open Dashboard" : "Create account"}
                        </NeonButton>
                    </div>
                </section>
            </main>
        </div>
    );
}
