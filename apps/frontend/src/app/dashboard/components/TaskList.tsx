import React, { useState, useMemo } from 'react';
import { Task, Priority } from '../types/dashboard';
import { dailyStatusApi } from '../../../utils/api';
import toast from 'react-hot-toast';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface TaskListProps {
    tasks: Task[];
    onAddTask: (title: string, priority?: Priority) => Promise<void>;
    onUpdateTask?: (id: string, data: Partial<Task>) => Promise<void>;
    onDeleteTask?: (id: string) => Promise<void>;
    onRefresh?: () => void;
}

type StatusFilter = 'ALL' | 'COMPLETED' | 'PENDING';
type PriorityFilter = 'ALL' | Priority;

const EMS_PER_PAGE = 5;

export const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask, onRefresh }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState<Priority>("MEDIUM");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editPriority, setEditPriority] = useState<Priority>("MEDIUM");

    type SortOption = 'a-z' | 'z-a' | 'priority-high' | 'priority-low';
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
    const [sortBy, setSortBy] = useState<SortOption>('a-z');
    const [currentPage, setCurrentPage] = useState(1);

    const getPriorityWeight = (p: Priority | undefined) => {
        switch (p) {
            case 'HIGH': return 3;
            case 'MEDIUM': return 2;
            case 'LOW': return 1;
            default: return 0;
        }
    };

    const filteredTasks = useMemo(() => {
        let filtered = tasks.filter(t => t.isActive);

        if (statusFilter === 'COMPLETED') {
            filtered = filtered.filter(t => t.completed);
        } else if (statusFilter === 'PENDING') {
            filtered = filtered.filter(t => !t.completed);
        }

        if (priorityFilter !== 'ALL') {
            filtered = filtered.filter(t => (t.taskPriority || t.priority) === priorityFilter);
        }

        return filtered.sort((a, b) => {


            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }



            const pA = a.taskPriority || a.priority;
            const pB = b.taskPriority || b.priority;

            switch (sortBy) {
                case 'a-z':
                    return a.title.localeCompare(b.title);
                case 'z-a':
                    return b.title.localeCompare(a.title);
                case 'priority-high':
                    return getPriorityWeight(pB) - getPriorityWeight(pA);
                case 'priority-low':
                    return getPriorityWeight(pA) - getPriorityWeight(pB);
                default:
                    return a.title.localeCompare(b.title);
            }
        });
    }, [tasks, statusFilter, priorityFilter, sortBy]);

    const paginatedTasks = useMemo(() => {
        const startIndex = (currentPage - 1) * EMS_PER_PAGE;
        return filteredTasks.slice(startIndex, startIndex + EMS_PER_PAGE);
    }, [filteredTasks, currentPage]);

    const totalPages = Math.ceil(filteredTasks.length / EMS_PER_PAGE);

    const pendingCount = tasks.filter(t => t.isActive && !t.completed).length;
    const completedCount = tasks.filter(t => t.isActive && t.completed).length;

    const getPriorityColor = (priority: Priority) => {
        switch (priority) {
            case "HIGH": return "bg-red-500/20 text-red-300 border-red-500/30";
            case "MEDIUM": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
            case "LOW": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
            default: return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30";
        }
    };

    const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
        if (editingTaskId === taskId) return;

        try {
            setTogglingTaskId(taskId);
            const today = new Date().toISOString().split('T')[0];
            await dailyStatusApi.updateDailyStatus({
                taskId,
                date: today,
                isCompleted: !currentStatus
            });
            toast.success(currentStatus ? "Task unmarked" : "Task completed! 🎉");
            onRefresh?.();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update task");
        } finally {
            setTogglingTaskId(null);
        }
    };

    const startEditing = (task: Task, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTaskId(task.id);
        setEditTitle(task.taskTitle || task.title);
        setEditPriority(task.taskPriority || task.priority);
    };

    const cancelEditing = () => {
        setEditingTaskId(null);
        setEditTitle("");
        setEditPriority("MEDIUM");
    };

    const saveEdit = async (taskId: string) => {
        if (!editTitle.trim()) return;

        try {
            await onUpdateTask?.(taskId, {
                title: editTitle,
                priority: editPriority
            });
            setEditingTaskId(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            setIsSubmitting(true);
            await onAddTask(newTaskTitle, newTaskPriority);

            setNewTaskTitle("");
            setNewTaskPriority("MEDIUM");
            setIsAdding(false);


        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <GlassCard className="h-[600px] overflow-hidden p-0">
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-white/5 flex flex-col gap-4 bg-white/5 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-white tracking-wide">Today's Tasks</h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                            <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded-md border border-green-500/20">
                                {completedCount} Done
                            </span>
                            <span className="bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-md border border-yellow-500/20">
                                {pendingCount} Left
                            </span>
                        </div>
                    </div>



                    <div className="flex gap-2 items-center flex-wrap">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value as StatusFilter);
                                setCurrentPage(1);
                            }}
                            className="bg-black/20 text-xs text-zinc-300 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500/50"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="COMPLETED">Completed</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(e) => {
                                setPriorityFilter(e.target.value as PriorityFilter);
                                setCurrentPage(1);
                            }}
                            className="bg-black/20 text-xs text-zinc-300 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500/50"
                        >
                            <option value="ALL">All Priorities</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>

                        <div className="w-px h-4 bg-white/10 mx-1"></div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="bg-black/20 text-xs text-zinc-300 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500/50"
                        >
                            <option value="a-z">A-Z</option>
                            <option value="z-a">Z-A</option>
                            <option value="priority-high">Priority (High-Low)</option>
                            <option value="priority-low">Priority (Low-High)</option>
                        </select>

                        {(statusFilter !== 'ALL' || priorityFilter !== 'ALL' || sortBy !== 'a-z') && (
                            <button
                                onClick={() => {
                                    setStatusFilter('ALL');
                                    setPriorityFilter('ALL');
                                    setSortBy('a-z');
                                    setCurrentPage(1);
                                }}
                                className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors ml-auto"
                                title="Reset View"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-4 custom-scrollbar">
                    {paginatedTasks.length === 0 ? (
                        filteredTasks.length === 0 ? (
                            <div className="h-40 flex flex-col items-center justify-center text-zinc-500 text-sm text-center px-6">
                                <span className="text-4xl mb-4 opacity-50">✨</span>
                                <p>No tasks found.<br />Adjust filters or add a new task.</p>
                            </div>
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center text-zinc-500 text-sm text-center px-6">
                                <p>Page is empty.</p>
                            </div>
                        )
                    ) : (
                        <ul className="space-y-2">
                            <AnimatePresence mode='popLayout'>
                                {paginatedTasks.map((task) => (
                                    <motion.li
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={task.id}
                                        className={cn(
                                            "group flex items-center gap-3 p-3 rounded-xl transition-all border border-transparent",
                                            editingTaskId === task.id ? "bg-white/10 ring-1 ring-cyan-500/50" : "hover:bg-white/5 hover:border-white/10 cursor-pointer",
                                            task.completed && editingTaskId !== task.id ? "opacity-50 grayscale-[0.5]" : "",
                                            togglingTaskId === task.id ? "pointer-events-none opacity-50" : ""
                                        )}
                                        onClick={() => !editingTaskId && handleToggleComplete(task.id, task.completed)}
                                    >
                                        {editingTaskId === task.id ? (
                                            <div className="flex-1 flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className="flex-1 px-3 py-2 text-sm bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEdit(task.id);
                                                        if (e.key === 'Escape') cancelEditing();
                                                    }}
                                                />
                                                <select
                                                    value={editPriority}
                                                    onChange={(e) => setEditPriority(e.target.value as Priority)}
                                                    className="px-2 py-2 text-xs bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white"
                                                >
                                                    <option value="LOW">Low</option>
                                                    <option value="MEDIUM">Medium</option>
                                                    <option value="HIGH">High</option>
                                                </select>
                                                <button onClick={() => saveEdit(task.id)} className="text-green-400 hover:text-green-300 p-2 hover:bg-green-400/10 rounded-lg">
                                                    ✓
                                                </button>
                                                <button onClick={cancelEditing} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg">
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className={cn(
                                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                                                    task.completed
                                                        ? "bg-cyan-500 border-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                                                        : "border-zinc-600 group-hover:border-cyan-500/50 bg-transparent"
                                                )}>
                                                    {task.completed && (
                                                        <motion.svg
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="w-4 h-4 font-bold"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </motion.svg>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className={cn(
                                                        "text-sm font-medium truncate transition-colors",
                                                        task.completed ? "text-zinc-500 line-through decoration-zinc-600" : "text-zinc-100"
                                                    )}>
                                                        {task.taskTitle || task.title}
                                                    </p>
                                                    {task.endDate && !task.completed && (
                                                        <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                                                            Due {new Date(task.endDate).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {!task.completed && (
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wide ${getPriorityColor(task.taskPriority || task.priority)}`}>
                                                            {task.taskPriority || task.priority}
                                                        </span>
                                                    )}

                                                    <div className={cn("flex items-center gap-1 transition-opacity", task.completed ? "invisible" : "opacity-0 group-hover:opacity-100")}>
                                                        <button
                                                            onClick={(e) => startEditing(task, e)}
                                                            className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-all"
                                                            title="Edit Task"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteTask?.(task.id);
                                                            }}
                                                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                                                            title="Delete Task"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </motion.li>
                                ))}
                            </AnimatePresence>
                        </ul>
                    )}
                </div>



                {totalPages > 1 && (
                    <div className="p-3 border-t border-white/5 bg-white/5 flex justify-center items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-xs text-zinc-400">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="p-4 border-t border-white/5 bg-white/5">
                    {isAdding ? (
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="What needs to be done?"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 text-sm bg-black/50 border border-white/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white placeholder:text-zinc-600"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={newTaskPriority}
                                    onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                                    disabled={isSubmitting}
                                    className="px-3 py-2 text-xs bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white"
                                >
                                    <option value="LOW">Low Priority</option>
                                    <option value="MEDIUM">Medium Priority</option>
                                    <option value="HIGH">High Priority</option>
                                </select>
                                <div className="flex-1"></div>
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    disabled={isSubmitting}
                                    className="px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <NeonButton
                                    type="submit"
                                    disabled={isSubmitting || !newTaskTitle.trim()}
                                    variant="primary"
                                    className="px-4 py-2 text-xs"
                                >
                                    {isSubmitting ? "Adding..." : "Add"}
                                </NeonButton>
                            </div>
                        </form>
                    ) : (
                        <NeonButton
                            onClick={() => setIsAdding(true)}
                            variant="secondary"
                            className="w-full justify-center border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
                        >
                            + Add New Task
                        </NeonButton>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};
