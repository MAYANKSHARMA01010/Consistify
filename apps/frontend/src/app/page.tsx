"use client";

import { useAuth } from "../context/AuthContext";
import { NeonButton } from "@/components/ui/NeonButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { SplashScreen } from "@/components/ui/SplashScreen";

export default function Home() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <SplashScreen message="Waking up server" />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center relative z-10 px-6 overflow-hidden">



      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center max-w-4xl mx-auto space-y-8 mt-20"
      >
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
          CONSISTIFY
        </h1>

        <p className="text-xl md:text-2xl text-zinc-300 font-light max-w-2xl mx-auto leading-relaxed">
          The <span className="text-cyan-400 font-semibold drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">ultimate</span> system to build habits that stick.
          Track progress in a universe of your own making.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
          {isLoggedIn ? (
            <NeonButton href="/dashboard" variant="primary" className="text-lg px-10 py-5">
              Enter Dashboard
            </NeonButton>
          ) : (
            <>
              <NeonButton href="/register" variant="primary">
                Start Journey
              </NeonButton>
              <NeonButton href="/login" variant="outline">
                Login
              </NeonButton>
            </>
          )}
        </div>
      </motion.div>



      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-6xl w-full">
        <GlassCard variant="hover-shine" className="p-8">
          <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 text-purple-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-white">Daily Tracking</h3>
          <p className="text-zinc-400">Log your habits with a single click. Visual feedback that feels rewarding.</p>
        </GlassCard>

        <GlassCard variant="hover-shine" className="p-8 delay-100">
          <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6 text-cyan-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-white">Analytics</h3>
          <p className="text-zinc-400">Deep dive into your consistency data. See streaks and trends over time.</p>
        </GlassCard>

        <GlassCard variant="hover-shine" className="p-8 delay-200">
          <div className="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center mb-6 text-pink-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-white">Journaling</h3>
          <p className="text-zinc-400">Reflect on your days. Connect your habits with your thoughts.</p>
        </GlassCard>
      </div>

      <div className="h-32"></div>
    </div>
  );
}
