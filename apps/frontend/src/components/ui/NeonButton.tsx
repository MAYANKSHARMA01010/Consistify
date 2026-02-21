"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/utils/cn";
import Link from "next/link";

interface NeonButtonProps extends HTMLMotionProps<"button"> {
    children: ReactNode;
    className?: string;
    variant?: "primary" | "secondary" | "outline";
    href?: string;
}

export function NeonButton({ children, className, variant = "primary", href, ...props }: NeonButtonProps) {
    const baseStyles = "relative px-8 py-4 rounded-xl font-bold text-sm tracking-wide uppercase transition-all duration-300 group overflow-hidden";

    const variants = {
        primary: "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.5)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.7)]",
        secondary: "bg-zinc-900 text-white border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800",
        outline: "bg-transparent text-white border-2 border-white/20 hover:border-white/50 hover:bg-white/5 shadow-[0_0_15px_-5px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]",
    };

    const content = (
        <span className="relative z-10 flex items-center gap-2">
            {children}
        </span>
    );

    if (href) {
        return (
            <Link href={href} className={cn(baseStyles, variants[variant], className)}>
                <motion.span
                    whileTap={{ scale: 0.95 }}
                    className="block w-full h-full"
                >
                    {content}


                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out]" />
                </motion.span>
            </Link>
        );
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(baseStyles, variants[variant], className)}
            {...props}
        >
            {content}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out]" />
        </motion.button>
    );
}
