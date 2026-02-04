import React, { useState, useMemo } from 'react';
import { Task, Priority } from '../types/dashboard';
import { dailyStatusApi } from '../../../utils/api';
import toast from 'react-hot-toast';

interface TaskListProps {
    tasks: Task[];
    onAddTask: (title: string, priority?: Priority) => Promise<void>;
    onRefresh?: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, onRefresh }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState<Priority>("MEDIUM");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

    const sortedTasks = useMemo(() => {
        const activeTasks = tasks.filter(t => t.isActive);

        const pendingTasks = activeTasks
            .filter(t => !t.completed)
            .sort((a, b) => a.title.localeCompare(b.title));

        const completedTasks = activeTasks
            .filter(t => t.completed)
            .sort((a, b) => a.title.localeCompare(b.title));

        return [...pendingTasks, ...completedTasks];
    }, [tasks]);

    const pendingCount = sortedTasks.filter(t => !t.completed).length;
    const completedCount = sortedTasks.filter(t => t.completed).length;
    const totalCount = sortedTasks.length;

    const getPriorityColor = (priority: Priority) => {
        switch (priority) {
            case "HIGH": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
            case "MEDIUM": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
            case "LOW": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
            default: return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
        }
    };

    const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full overflow-hidden min-h-[300px]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="font-semibold text-gray-900 dark:text-white">Today's Tasks</h3>
                <div className="flex items-center gap-2 text-xs">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                        {completedCount} ✓
                    </span>
                    <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                        {pendingCount} ⏳
                    </span>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        {totalCount} Total
                    </span>
                </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2">
                {sortedTasks.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-gray-400 text-sm text-center px-6">
                        <p>All caught up! 🎉<br />Add a new task to get started.</p>
                    </div>
                ) : (
                    <ul className="space-y-1">
                        {sortedTasks.map((task) => (
                            <li
                                key={task.id}
                                onClick={() => handleToggleComplete(task.id, task.completed)}
                                className={`group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${task.completed ? "opacity-60" : ""
                                    } ${togglingTaskId === task.id ? "pointer-events-none opacity-50" : ""}`}
                            >
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${task.completed
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "border-gray-300 dark:border-gray-500 group-hover:border-indigo-500"
                                    }`}>
                                    {task.completed && (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${task.completed
                                        ? "text-gray-500 line-through decoration-gray-400"
                                        : "text-gray-900 dark:text-white"
                                        }`}>
                                        {task.taskTitle || task.title}
                                    </p>
                                    {task.endDate && !task.completed && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Due {new Date(task.endDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>

                                {!task.completed && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${getPriorityColor(task.taskPriority || task.priority)}`}>
                                        {task.taskPriority || task.priority}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                {isAdding ? (
                    <form onSubmit={handleSubmit} className="space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                autoFocus
                                placeholder="What needs to be done?"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                disabled={isSubmitting}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={newTaskPriority}
                                onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                                disabled={isSubmitting}
                                className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
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
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !newTaskTitle.trim()}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {isSubmitting ? "Adding..." : "Add Task"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full py-2 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500 transition-all shadow-sm"
                    >
                        + Add New Task
                    </button>
                )}
            </div>
        </div>
    );
};
