import React from "react";
import { WeeklyReport } from "../types/dashboard";
import { GlassCard } from "@/components/ui/GlassCard";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    PolarAngleAxis,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface WeeklyProgressChartProps {
    report: WeeklyReport | null;
}

const formatDay = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { weekday: "short" });
};

export const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({ report }) => {
    if (!report) {
        return (
            <GlassCard className="p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Weekly Charts</h3>
                <p className="text-sm text-zinc-500">No report data available yet.</p>
            </GlassCard>
        );
    }

    const chartData = report.chart.map((day) => ({
        day: formatDay(day.date),
        completedTasks: day.completedTasks,
        consistency: Number(day.consistency.toFixed(2)),
    }));

    const productivityData = [
        {
            name: "Productivity",
            value: report.summary.productivityScore,
            fill: "#22d3ee",
        },
    ];

    return (
        <GlassCard className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Charts</h3>
                    <p className="text-xs text-zinc-500">{report.range.start} to {report.range.end}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">Productivity Score</p>
                    <p className="text-lg font-black text-cyan-400">{report.summary.productivityScore}/100</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 min-w-0">
                    <h4 className="text-xs font-bold tracking-wider uppercase text-zinc-400 mb-3">Tasks Completed Per Day</h4>
                    <div className="h-64 min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis dataKey="day" stroke="#a1a1aa" fontSize={11} />
                                <YAxis stroke="#a1a1aa" fontSize={11} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #27272a", borderRadius: "10px" }}
                                    labelStyle={{ color: "#e5e7eb" }}
                                />
                                <Legend wrapperStyle={{ fontSize: "11px" }} />
                                <Bar dataKey="completedTasks" name="Completed" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 min-w-0">
                    <h4 className="text-xs font-bold tracking-wider uppercase text-zinc-400 mb-3">Weekly Consistency</h4>
                    <div className="h-64 min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis dataKey="day" stroke="#a1a1aa" fontSize={11} />
                                <YAxis stroke="#a1a1aa" fontSize={11} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                                <Tooltip
                                    formatter={(value) => [`${value}%`, "Consistency"]}
                                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #27272a", borderRadius: "10px" }}
                                    labelStyle={{ color: "#e5e7eb" }}
                                />
                                <Legend wrapperStyle={{ fontSize: "11px" }} />
                                <Line type="monotone" dataKey="consistency" name="Consistency" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col items-center justify-center min-w-0">
                    <h4 className="text-xs font-bold tracking-wider uppercase text-zinc-400 mb-3">Productivity Score</h4>
                    <div className="h-64 w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                            <RadialBarChart
                                cx="50%"
                                cy="50%"
                                innerRadius="65%"
                                outerRadius="100%"
                                data={productivityData}
                                startAngle={90}
                                endAngle={-270}
                                barSize={20}
                            >
                                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                                <RadialBar background dataKey="value" cornerRadius={10} />
                                <Tooltip
                                    formatter={(value) => [`${value}/100`, "Score"]}
                                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #27272a", borderRadius: "10px" }}
                                    labelStyle={{ color: "#e5e7eb" }}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-3xl font-black text-cyan-300 -mt-6">{report.summary.productivityScore}</p>
                </div>
            </div>
        </GlassCard>
    );
};
