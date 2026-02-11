import React, { useState } from 'react';
import { DailyStatusData, Mood } from '../types/dashboard';

interface DailyStatusProps extends DailyStatusData {
    onUpdate?: (data: { focus?: string; mood?: Mood; notes?: string }) => void;
}

export const DailyStatus: React.FC<DailyStatusProps> = ({ date, focus, mood, note, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editFocus, setEditFocus] = useState(focus || "");
    const [editMood, setEditMood] = useState<Mood>(mood || "NORMAL");
    const [editNotes, setEditNotes] = useState(note || "");

    React.useEffect(() => {
        setEditFocus(focus || "");
        setEditMood(mood || "NORMAL");
        setEditNotes(note || "");
    }, [focus, mood, note, date]);

    const isToday = new Date().toISOString().split('T')[0] === date;

    const getMoodEmoji = (mood: Mood | undefined) => {
        switch (mood) {
            case "HIGH": return "⚡️";
            case "NORMAL": return "🙂";
            case "LOW": return "☕️";
            default: return "🤔";
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate?.({ focus: editFocus, mood: editMood, notes: editNotes });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Set Status</h3>
                    <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Primary Focus</label>
                        <input
                            type="text"
                            value={editFocus}
                            onChange={(e) => setEditFocus(e.target.value)}
                            placeholder="What's your main goal today?"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Energy Level</label>
                        <div className="flex gap-2">
                            {(["LOW", "NORMAL", "HIGH"] as Mood[]).map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setEditMood(m)}
                                    className={`flex-1 py-2 text-xl rounded-lg border transition-all ${editMood === m
                                        ? "bg-indigo-100 border-indigo-300 dark:bg-indigo-900 dark:border-indigo-700"
                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                        }`}
                                >
                                    {getMoodEmoji(m)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Notes / Reflection</label>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditNotes(prev => prev ? prev + "\n• " : "• ");
                                }}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                                <span className="text-lg leading-none">•</span> Add Bullet Point
                            </button>
                        </div>
                        <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const textarea = e.currentTarget;
                                    const cursorPosition = textarea.selectionStart;
                                    const textBeforeCursor = editNotes.substring(0, cursorPosition);
                                    const textAfterCursor = editNotes.substring(cursorPosition);

                                    const lastLineIndex = textBeforeCursor.lastIndexOf('\n');
                                    const currentLine = textBeforeCursor.substring(lastLineIndex + 1);

                                    const bulletMatch = currentLine.match(/^(\s*[•-]\s*)/);

                                    if (bulletMatch) {
                                        const newText = textBeforeCursor + "\n" + bulletMatch[1] + textAfterCursor;
                                        setEditNotes(newText);
                                        setTimeout(() => {
                                            textarea.selectionStart = textarea.selectionEnd = cursorPosition + bulletMatch[1].length + 1;
                                        }, 0);
                                    } else {
                                        const newText = textBeforeCursor + "\n" + textAfterCursor;
                                        setEditNotes(newText);
                                        setTimeout(() => {
                                            textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1;
                                        }, 0);
                                    }
                                }
                            }}
                            placeholder="How did the day go? Any blockers or wins?"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-24 font-mono"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition-colors shadow-sm"
                    >
                        Save Status
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-gray-700 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg uppercase tracking-wider">
                        Today's Status
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3">
                    {mood && (
                        <div className="text-2xl" title={`Energy Level: ${mood}`}>
                            {getMoodEmoji(mood)}
                        </div>
                    )}
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 text-gray-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit Status & Notes"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <h4 className="text-gray-400 dark:text-gray-500 text-xs uppercase font-medium mb-1">Primary Focus</h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                    {focus || "No focus set"}
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                    <h4 className="text-gray-400 dark:text-gray-500 text-xs uppercase font-medium mb-1">Notes</h4>
                    {note ? (
                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                            {note}
                        </p>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-sm text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                        >
                            <span className="text-lg leading-none">+</span> Add notes for this day
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
