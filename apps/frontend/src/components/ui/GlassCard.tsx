"use client";

import { cn } from "@/utils/cn";
import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    className?: string;
    variant?: "default" | "hover-shine";
}

export function GlassCard({ children, className, variant = "default", ...props }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={variant === "hover-shine" ? { scale: 1.02 } : undefined}
            className={cn(
                "glass-panel rounded-2xl p-6 border border-white/5 relative overflow-hidden group transition-colors",
                className
            )}
            {...props}
        >
            {/* Shine effect on hover */}
            {variant === "hover-shine" && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shine_1s_ease-in-out] bg-gradient-to-r from-transparent via-white/5 to-transparent z-10 pointer-events-none" />
            )}
            <div className="relative z-20">
                {children}
            </div>
        </motion.div>
    );
}
