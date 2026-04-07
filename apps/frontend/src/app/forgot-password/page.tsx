"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { authApi, getErrorMessage } from "../../utils/api";
import { forgotPasswordSchema } from "../../utils/validators";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = forgotPasswordSchema.safeParse({ email });
        if (!result.success) {
            toast.error(result.error.issues[0]?.message || "Enter a valid email");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await authApi.forgotPassword(email);
            toast.success(response.message || "If your account exists, a reset link has been sent");
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
                    <h2 className="text-3xl font-black tracking-tighter text-white">Forgot Password</h2>
                    <p className="mt-2 text-sm text-zinc-400">Enter your account email to receive a reset link.</p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-zinc-600"
                            placeholder="you@example.com"
                        />
                    </div>

                    <NeonButton type="submit" className="w-full justify-center" disabled={isSubmitting} variant="primary">
                        {isSubmitting ? "Sending reset link..." : "Send reset link"}
                    </NeonButton>
                </form>

                <p className="text-center text-sm text-zinc-500">
                    Remembered your password? <Link href="/login" className="text-cyan-400 hover:text-cyan-300">Back to login</Link>
                </p>
            </GlassCard>
        </div>
    );
}
