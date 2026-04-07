import { Suspense } from "react";
import { VerifyEmailClient } from "./VerifyEmailClient";
import { GlassCard } from "@/components/ui/GlassCard";

function VerifyEmailSkeleton() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative z-10">
            <GlassCard className="w-full max-w-md space-y-6 p-8 md:p-10 text-center">
                <h2 className="text-3xl font-black tracking-tighter text-white">Email Verification</h2>
                <div className="h-6 bg-white/10 rounded animate-pulse mx-auto w-48"></div>
            </GlassCard>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<VerifyEmailSkeleton />}>
            <VerifyEmailClient />
        </Suspense>
    );
}
