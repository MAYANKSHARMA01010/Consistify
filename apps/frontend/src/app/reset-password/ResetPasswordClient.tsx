"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi, getErrorMessage } from "../../utils/api";
import { resetPasswordSchema } from "../../utils/validators";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";

export function ResetPasswordClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error("Reset token is missing or invalid");
            return;
        }

        const result = resetPasswordSchema.safeParse({ password, confirmPassword });
        if (!result.success) {
            toast.error(result.error.issues[0]?.message || "Invalid form");
            return;
        }

        setIsSubmitting(true);
        try {
            await authApi.resetPassword(token, password);
            toast.success("Password reset successfully. Please sign in.");
            router.push("/login");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative z-10">
            <GlassCard className="w-full max-w-md space-y-8 p-8 md:p-10">
                <div className="text-center">
                    <h2 className="text-3xl font-black tracking-tighter text-white">Reset Password</h2>
                    <p className="mt-2 text-sm text-zinc-400">Create a new password for your account.</p>
                </div>

                {!token ? (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                        Invalid reset link. Request a new one from the forgot password page.
                    </div>
                ) : (
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-400 mb-1">New password</label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-zinc-600"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-400 mb-1">Confirm password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-zinc-600"
                                placeholder="••••••••"
                            />
                        </div>

                        <NeonButton type="submit" className="w-full justify-center" disabled={isSubmitting} variant="primary">
                            {isSubmitting ? "Resetting password..." : "Reset password"}
                        </NeonButton>
                    </form>
                )}

                <p className="text-center text-sm text-zinc-500">
                    <Link href="/login" className="text-cyan-400 hover:text-cyan-300">Back to login</Link>
                </p>
            </GlassCard>
        </div>
    );
}
