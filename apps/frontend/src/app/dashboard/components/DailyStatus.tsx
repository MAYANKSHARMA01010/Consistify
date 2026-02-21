import React, { useState } from 'react';
import { DailyStatusData, Mood } from '../types/dashboard';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { cn } from '@/utils/cn';

interface DailyStatusProps extends DailyStatusData {
    onUpdate?: (data: { focus?: string; mood?: Mood; notes?: string }) => void;
}

const MOODS_CONFIG: Record<string, string> = {
    "LOW": "☕️",
    "NORMAL": "🙂",
    "HIGH": "⚡️",
    "FOCUSED": "🧠",
    "STRESSED": "🤯",
    "RELAXED": "😎",
    "GRATEFUL": "🙏",
    "TIRED": "😴"
};

const COMMON_EMOJIS = ["😀", "😍", "🥳", "🥶", "😡", "🤒", "👻", "👽", "🤖", "👾", "💪", "🤙", "💅", "🦄", "🌈", "🔥", "✨", "🎉", "💤", "👀"];

export const DailyStatus: React.FC<DailyStatusProps> = ({ date, focus, mood, note, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editFocus, setEditFocus] = useState(focus || "");
    const [editMood, setEditMood] = useState<string>(mood || "NORMAL");
    const [editNotes, setEditNotes] = useState(note || "");



    const [customMoodName, setCustomMoodName] = useState("");
    const [customMoodEmoji, setCustomMoodEmoji] = useState("🙂");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    React.useEffect(() => {
        setEditFocus(focus || "");

        const currentMood = mood || "NORMAL";


        if (MOODS_CONFIG[currentMood]) {
            setEditMood(currentMood);
            setCustomMoodName("");
            setCustomMoodEmoji("🙂");
        } else if (currentMood.includes('|')) {


            const [emoji, name] = currentMood.split('|');
            setEditMood("CUSTOM");
            setCustomMoodEmoji(emoji);
            setCustomMoodName(name);
        } else {


            setEditMood("CUSTOM");
            setCustomMoodName(currentMood);
        }

        setEditNotes(note || "");
    }, [focus, mood, note, date]);

    const getMoodEmoji = (moodStr: string | undefined) => {
        if (!moodStr) return "🤔";
        if (MOODS_CONFIG[moodStr]) return MOODS_CONFIG[moodStr];
        if (moodStr.includes('|')) return moodStr.split('|')[0];
        return "🤔";
    };

    const getMoodLabel = (moodStr: string | undefined) => {
        if (!moodStr) return "Unknown";
        if (MOODS_CONFIG[moodStr]) return moodStr;
        if (moodStr.includes('|')) return moodStr.split('|')[1];
        return moodStr;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let finalMood = editMood;
        if (editMood === "CUSTOM") {
            if (!customMoodName.trim()) {


                finalMood = "NORMAL";
            } else {
                finalMood = `${customMoodEmoji}|${customMoodName.trim()}`;
            }
        }

        onUpdate?.({ focus: editFocus, mood: finalMood, notes: editNotes });
        setIsEditing(false);
    };

    const inputClasses = "w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500/50 outline-none transition-all placeholder:text-zinc-600";
    const labelClasses = "block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2";

    if (isEditing) {
        return (
            <GlassCard className="p-6 h-full overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Set Status</h3>
                    <button onClick={() => setIsEditing(false)} className="text-zinc-500 hover:text-white transition-colors">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className={labelClasses}>Primary Focus</label>
                        <input
                            type="text"
                            value={editFocus}
                            onChange={(e) => setEditFocus(e.target.value)}
                            placeholder="What's your main goal today?"
                            className={inputClasses}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Energy Level & Mood</label>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            {Object.keys(MOODS_CONFIG).map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => {
                                        setEditMood(m);


                                        setCustomMoodName("");
                                    }}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-2 rounded-xl border transition-all gap-1 h-20",
                                        editMood === m
                                            ? "bg-cyan-500/20 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                                            : "bg-black/30 border-white/10 hover:bg-white/5 text-zinc-500"
                                    )}
                                >
                                    <span className="text-2xl">{MOODS_CONFIG[m]}</span>
                                    <span className="text-[9px] font-bold uppercase tracking-wider truncate w-full text-center">{m}</span>
                                </button>
                            ))}
                        </div>



                        <div className={cn(
                            "border rounded-xl p-3 transition-all",
                            editMood === "CUSTOM"
                                ? "bg-cyan-500/5 border-cyan-500/50"
                                : "bg-black/20 border-white/5"
                        )}>
                            <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => setEditMood("CUSTOM")}>
                                <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", editMood === "CUSTOM" ? "border-cyan-500 bg-cyan-500" : "border-zinc-500")}>
                                    {editMood === "CUSTOM" && <div className="w-2 h-2 rounded-full bg-black"></div>}
                                </div>
                                <span className={cn("text-xs font-bold uppercase tracking-wider", editMood === "CUSTOM" ? "text-cyan-400" : "text-zinc-500")}>Custom Mood</span>
                            </div>

                            {editMood === "CUSTOM" && (
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="h-full px-3 bg-black/30 border border-white/10 rounded-xl text-2xl hover:bg-white/5 transition-colors"
                                        >
                                            {customMoodEmoji}
                                        </button>

                                        {showEmojiPicker && (
                                            <div className="absolute bottom-full left-0 mb-2 p-2 bg-zinc-900 border border-white/10 rounded-xl shadow-xl w-64 flex flex-wrap gap-1 z-50">
                                                {COMMON_EMOJIS.map(emoji => (
                                                    <button
                                                        key={emoji}
                                                        type="button"
                                                        onClick={() => {
                                                            setCustomMoodEmoji(emoji);
                                                            setShowEmojiPicker(false);
                                                        }}
                                                        className="p-1.5 hover:bg-white/10 rounded-md text-xl"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Name your mood..."
                                        className={cn(inputClasses, "py-2 text-xs flex-1")}
                                        value={customMoodName}
                                        onChange={(e) => setCustomMoodName(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className={labelClasses}>Notes / Reflection</label>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditNotes(prev => prev ? prev + "\n• " : "• ");
                                }}
                                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 uppercase tracking-wider"
                            >
                                <span className="text-lg leading-none">+</span> Bullet Point
                            </button>
                        </div>
                        <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="How did the day go? Any blockers or wins?"
                            className={`${inputClasses} resize-none h-32 font-mono text-xs leading-relaxed`}
                        />
                    </div>
                    <NeonButton
                        type="submit"
                        className="w-full justify-center"
                        variant="primary"
                    >
                        Save Status
                    </NeonButton>
                </form>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded-md border border-cyan-500/20 uppercase tracking-widest">
                        Today's Status
                    </span>
                    <span className="text-zinc-500 text-xs font-mono">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3">
                    {mood && (
                        <div className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" title={`Energy Level: ${getMoodLabel(mood)}`}>
                            {getMoodEmoji(mood)}
                        </div>
                    )}
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        title="Edit Status & Notes"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <h4 className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-2">Primary Focus</h4>
                <p className="text-xl font-medium text-white leading-tight drop-shadow-md">
                    {focus || <span className="text-zinc-600 italic">No focus set...</span>}
                </p>
            </div>

            <div className="flex-1 border-t border-white/5 pt-4">
                <h4 className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-2">Notes</h4>
                {note ? (
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap font-light leading-relaxed">
                        {note}
                    </p>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-zinc-600 hover:text-cyan-400 flex items-center gap-2 transition-colors mt-2"
                    >
                        <span className="text-lg leading-none opacity-50">+</span> Add notes for this day
                    </button>
                )}
            </div>
        </GlassCard>
    );
};
