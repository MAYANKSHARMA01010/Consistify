"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { authApi, getErrorMessage } from "@/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";

export function VerifyEmailClient() {
    const searchParams = useSearchParams();
    const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [errorMessage, setErrorMessage] = useState("Verification failed. Request a new link.");
    const [isResending, setIsResending] = useState(false);
    const [email, setEmail] = useState("");

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus("error");
                setErrorMessage("Verification token is missing");
                return;
            }

            try {
                await authApi.verifyEmail(token);
                setStatus("success");
                toast.success("Email verified successfully");
            } catch (err: unknown) {
                setStatus("error");
                setErrorMessage(getErrorMessage(err));
            }
        };

        verify();
    }, [token]);

    const handleResend = async () => {
        if (!email) {
            toast.error("Enter your email to resend verification");
            return;
        }

        setIsResending(true);
        try {
            await authApi.requestEmailVerification(email);
            toast.success("If your account exists, a verification link has been sent");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err));
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative z-10">
            <GlassCard className="w-full max-w-md space-y-6 p-8 md:p-10 text-center">
                <h2 className="text-3xl font-black tracking-tighter text-white">Email Verification</h2>

                {status === "verifying" && <p className="text-zinc-300">Verifying your email...</p>}
                {status === "success" && (
                    <>
                        <p className="text-emerald-300">Your email has been verified. You can now sign in.</p>
                        <Link href="/login">
                            <NeonButton variant="primary" className="w-full justify-center">Go to login</NeonButton>
                        </Link>
                    </>
                )}
                {status === "error" && (
                    <div className="space-y-4 text-left">
                        <p className="text-red-300">{errorMessage}</p>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-1">Resend to email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-zinc-600"
                                placeholder="you@example.com"
                            />
                        </div>
                        <NeonButton type="button" onClick={handleResend} disabled={isResending} variant="secondary" className="w-full justify-center">
                            {isResending ? "Sending..." : "Resend verification email"}
                        </NeonButton>
                        <Link href="/login" className="block text-center text-sm text-cyan-400 hover:text-cyan-300">
                            Back to login
                        </Link>
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
