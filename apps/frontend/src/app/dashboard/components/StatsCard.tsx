import React, { ReactNode } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon?: ReactNode;
    trend?: "up" | "down" | "neutral";
    description?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, description }) => {
    const getTrendColor = (trend: "up" | "down" | "neutral" | undefined) => {
        switch (trend) {
            case "up": return "text-green-400";
            case "down": return "text-red-400";
            default: return "text-zinc-500";
        }
    };

    const getTrendIcon = (trend: "up" | "down" | "neutral" | undefined) => {
        switch (trend) {
            case "up": return "↑";
            case "down": return "↓";
            default: return "→";
        }
    };

    return (
        <GlassCard className="flex flex-col justify-between h-full p-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{title}</h3>
                {icon && <div className="text-zinc-500 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{icon}</div>}
            </div>

            <div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{value}</span>
                    {trend && (
                        <span className={`text-sm font-bold ${getTrendColor(trend)} flex items-center gap-1`}>
                            <span>{getTrendIcon(trend)}</span>
                        </span>
                    )}
                </div>

                {description && (
                    <p className="text-zinc-500 text-xs mt-2">{description}</p>
                )}
            </div>
        </GlassCard>
    );
};
