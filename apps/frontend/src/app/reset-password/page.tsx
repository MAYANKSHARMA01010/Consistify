import { Suspense } from "react";
import { ResetPasswordClient } from "./ResetPasswordClient";
import { GlassCard } from "@/components/ui/GlassCard";

function ResetPasswordSkeleton() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative z-10">
            <GlassCard className="w-full max-w-md space-y-8 p-8 md:p-10">
                <div className="text-center">
                    <h2 className="text-3xl font-black tracking-tighter text-white">Reset Password</h2>
                    <p className="mt-2 text-sm text-zinc-400">Create a new password for your account.</p>
                </div>
                <div className="space-y-5 animate-pulse">
                    <div className="h-12 bg-white/10 rounded-xl"></div>
                    <div className="h-12 bg-white/10 rounded-xl"></div>
                    <div className="h-11 bg-cyan-400/20 rounded-xl"></div>
                </div>
            </GlassCard>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordSkeleton />}>
            <ResetPasswordClient />
        </Suspense>
    );
}
