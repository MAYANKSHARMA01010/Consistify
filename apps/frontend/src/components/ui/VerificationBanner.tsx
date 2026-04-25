"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { apiFetch, authApi } from "@/api";
import toast from "react-hot-toast";
import { AlertCircle, Loader2, X } from "lucide-react";

export default function VerificationBanner() {
    const { user, isLoggedIn, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [dismissing, setDismissing] = useState(false);

    if (!isLoggedIn || !user || user.emailVerified || user.verificationBannerDismissed) {
        return null;
    }

    const handleResend = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await apiFetch("/api/auth/verify-email/request", {
                method: "POST",
                body: JSON.stringify({ email: user.email }),
                headers: { "Content-Type": "application/json" }
            });
            toast.success("Verification email sent! Please check your inbox.");
        } catch (error: any) {
            toast.error(error.message || "Failed to send verification email");
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = async () => {
        if (dismissing) return;
        setDismissing(true);
        try {
            await authApi.dismissBanner();
            await refreshUser();
        } catch (error) {
            console.error("Failed to dismiss banner", error);
        } finally {
            setDismissing(false);
        }
    };

    return (
        <div className="sticky top-[72px] w-full bg-yellow-500/90 backdrop-blur-md text-black px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm z-40 pr-10 shadow-lg font-medium">
            <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Your account is not verified. Please verify your email to access all features.</span>
            </div>
            <button
                onClick={handleResend}
                disabled={loading}
                className="font-bold underline hover:text-black/70 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Resend verification email
            </button>
            <button 
                onClick={handleDismiss}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-md transition-colors text-black/60 hover:text-black"
                aria-label="Dismiss banner"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
