import React from 'react';
import { DailySummary } from '../types/dashboard';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface HistoryRailProps {
    history: DailySummary[];
}

export const HistoryRail: React.FC<HistoryRailProps> = ({ history }) => {
    const router = useRouter();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            day: date.toLocaleDateString('en-US', { day: 'numeric' }),
            weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
        };
    };

    const getMoodEmoji = (mood?: string | null) => {
        switch (mood) {
            case "HIGH": return "⚡️";
            case "NORMAL": return "🙂";
            case "LOW": return "☕️";
            default: return "🤔";
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent History</h3>
                    <p className="text-xs text-zinc-500">Your last 7 days at a glance</p>
                </div>
                <button
                    onClick={() => router.push('/history')}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                >
                    View Full History <span>→</span>
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                {history.map((day, index) => {
                    const { day: dayNum, weekday } = formatDate(day.date);
                    const isToday = new Date(day.date).toDateString() === new Date().toDateString();

                    return (
                        <motion.div
                            key={day.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            onClick={() => router.push(`/history?date=${day.date.split('T')[0]}`)}
                            className="cursor-pointer"
                        >
                            <GlassCard className={`p-4 h-full flex flex-col justify-between group relative overflow-hidden ${isToday ? 'border-cyan-500/30' : ''}`}>
                                {isToday && (
                                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-cyan-500 text-[8px] font-bold text-black uppercase rounded-bl-lg">
                                        Today
                                    </div>
                                )}

                                <div className="text-center mb-3">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">{weekday}</span>
                                    <span className={`text-2xl font-black block ${isToday ? 'text-cyan-400' : 'text-white'}`}>{dayNum}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-center">
                                        <span className="text-2xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                            {getMoodEmoji(day.mood)}
                                        </span>
                                    </div>

                                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                                            style={{ width: `${day.consistency}%` }}
                                        />
                                    </div>

                                    <p className="text-[10px] text-center text-zinc-500 truncate px-1">
                                        {day.focus || "No focus"}
                                    </p>
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
