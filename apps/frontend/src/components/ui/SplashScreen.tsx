"use client";

import { motion } from "framer-motion";

export const SplashScreen = ({ message = "Waking up server" }: { message?: string }) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative flex flex-col items-center"
            >
                <div className="relative w-32 h-32 flex items-center justify-center mb-10">
                    <div className="absolute w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,1)] z-10"></div>

                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute w-full h-full rounded-full border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
                    >
                        <div className="absolute -top-1.5 left-1/2 -ml-1.5 w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]"></div>
                    </motion.div>

                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="absolute w-24 h-24 rounded-full border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.1)]"
                    >
                        <div className="absolute -bottom-1 left-1/2 -ml-1 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.8)]"></div>
                    </motion.div>
                </div>

                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300 uppercase mb-3"
                >
                    Consistify
                </motion.h2>
                <div className="flex items-center gap-1">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="text-sm font-light text-zinc-400 tracking-widest uppercase"
                    >
                        {message}
                    </motion.p>
                    <motion.div className="flex space-x-1 ml-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                        <motion.div className="w-1 h-1 bg-zinc-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                        <motion.div className="w-1 h-1 bg-zinc-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                        <motion.div className="w-1 h-1 bg-zinc-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};
