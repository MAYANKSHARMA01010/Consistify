"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";

export default function SettingsPage() {
    const { user, loading, isLoggedIn, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isLoggedIn) {
            router.replace("/login");
            toast.error("Please login to continue");
        }
    }, [loading, isLoggedIn, router]);

    if (loading) {
        return null;
    }

    if (!isLoggedIn) {
        return null;
    }

    return (
        <div className="min-h-screen px-6 py-24">
            <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
                <header className="flex flex-col gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-400/80">Account</p>
                    <h1 className="text-4xl font-black tracking-tighter text-white sm:text-5xl">
                        Settings
                    </h1>
                    <p className="max-w-2xl text-sm text-zinc-400 sm:text-base">
                        Review your account identity, security state, and shortcuts to recovery flows.
                    </p>
                </header>

                <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <GlassCard className="p-8">
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.35em] text-zinc-500">Profile</p>
                                <h2 className="mt-2 text-2xl font-black text-white">{user?.name}</h2>
                                <p className="text-sm text-zinc-400">{user?.email}</p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <DetailItem label="Username" value={user?.username || "-"} />
                                <DetailItem label="Role" value={user?.role || "USER"} />
                                <DetailItem
                                    label="Email verification"
                                    value={user?.emailVerified ? "Verified" : "Pending"}
                                />
                                <DetailItem label="XP" value={String(user?.xp ?? 0)} />
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-8">
                        <div className="flex h-full flex-col gap-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.35em] text-zinc-500">Security</p>
                                <h2 className="mt-2 text-2xl font-black text-white">Recovery shortcuts</h2>
                            </div>

                            <div className="space-y-3 text-sm text-zinc-300">
                                <QuickLink href="/verify-email" label="Verify email" description="Resend or complete email verification." />
                                <QuickLink href="/forgot-password" label="Reset password" description="Generate a fresh password reset link." />
                                <QuickLink href="/dashboard" label="Back to dashboard" description="Return to your progress overview." />
                            </div>

                            <div className="mt-auto flex flex-col gap-3 pt-2">
                                <NeonButton
                                    onClick={logout}
                                    variant="secondary"
                                    className="w-full justify-center px-5 py-3 text-sm"
                                >
                                    Logout
                                </NeonButton>
                            </div>
                        </div>
                    </GlassCard>
                </section>
            </main>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-500">{label}</p>
            <p className="mt-2 text-sm font-semibold text-white">{value}</p>
        </div>
    );
}

function QuickLink({
    href,
    label,
    description,
}: {
    href: string;
    label: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition-colors hover:border-cyan-400/40 hover:bg-white/10"
        >
            <p className="font-semibold text-white">{label}</p>
            <p className="mt-1 text-sm text-zinc-400">{description}</p>
        </Link>
    );
}