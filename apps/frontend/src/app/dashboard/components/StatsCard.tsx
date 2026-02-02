import React, { ReactNode } from 'react';

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
            case "up": return "text-green-500";
            case "down": return "text-red-500";
            default: return "text-gray-400";
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
                {icon && <div className="text-gray-400 dark:text-gray-500">{icon}</div>}
            </div>

            <div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
                    {trend && (
                        <span className={`text-sm font-medium ${getTrendColor(trend)} flex items-center gap-1`}>
                            <span>{getTrendIcon(trend)}</span>
                        </span>
                    )}
                </div>

                {description && (
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">{description}</p>
                )}
            </div>
        </div>
    );
};
