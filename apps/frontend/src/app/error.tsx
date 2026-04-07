"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        toast.error(error.message || "Unexpected error occurred");
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative z-10">
            <GlassCard className="w-full max-w-lg space-y-6 p-8 md:p-10 text-center">
                <h2 className="text-3xl font-black tracking-tighter text-white">Something went wrong</h2>
                <p className="text-zinc-300">{error.message || "An unexpected error occurred while loading this page."}</p>
                <NeonButton type="button" onClick={reset} className="w-full justify-center" variant="primary">
                    Try again
                </NeonButton>
            </GlassCard>
        </div>
    );
}
