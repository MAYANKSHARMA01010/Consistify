"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { registerSchema } from "../../utils/validators";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "../../utils/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const { register, isLoggedIn, loading } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && isLoggedIn) {
            router.replace("/dashboard");
            toast.success("Welcome back!");
        }
    }, [isLoggedIn, loading, router]);

    if (loading || isLoggedIn) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result = registerSchema.safeParse(formData);

        if (!result.success) {
            result.error.issues.forEach((issue) => {
                toast.error(issue.message);
            });
            setIsSubmitting(false);
            return;
        }

        try {
            await register({
                name: formData.name,
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            toast.success("Account created successfully!");
            router.push("/login");
        } catch (err: any) {
            toast.error(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = () => {
        const backendUrl = process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_BACKEND_SERVER_URL
            : process.env.NEXT_PUBLIC_BACKEND_LOCAL_URL;
        window.location.href = `${backendUrl}/api/auth/google`;
    };

    const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-zinc-600";
    const labelClasses = "block text-sm font-medium text-zinc-400 mb-1";

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative z-10">
            <GlassCard className="w-full max-w-md space-y-8 p-8 md:p-10">
                <div className="text-center">
                    <h2 className="text-3xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className={labelClasses}>
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label htmlFor="username" className={labelClasses}>
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="pookie"
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className={labelClasses}>
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className={labelClasses}>
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[40px] text-zinc-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="relative">
                            <label htmlFor="confirmPassword" className={labelClasses}>
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={inputClasses}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-[34px] text-zinc-400 hover:text-white transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <NeonButton
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full justify-center"
                            variant="primary"
                        >
                            {isSubmitting ? "Creating account..." : "Sign up"}
                        </NeonButton>
                    </div>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-[#0b0b0b] px-2 text-zinc-500">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div>
                    <button
                        onClick={handleGoogleLogin}
                        className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        <span className="text-sm font-semibold leading-6">Google</span>
                    </button>
                </div>
            </GlassCard>
        </div>
    );
}
