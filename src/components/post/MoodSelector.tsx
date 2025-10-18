"use client";

import type { Mood } from "./types";

interface MoodSelectorProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
}

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: "relax", label: "リラックス", emoji: "😌" },
  { value: "focus", label: "集中", emoji: "🎧" },
  { value: "idea", label: "発想", emoji: "💡" },
  { value: "chat", label: "雑談", emoji: "💬" },
];

export default function MoodSelector({
  selectedMood,
  onMoodSelect,
}: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onMoodSelect(mood.value)}
          className={`
            flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all
            ${
              selectedMood === mood.value
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }
          `}
        >
          <span className="text-2xl">{mood.emoji}</span>
          <span className="text-xs font-medium text-slate-700">
            {mood.label}
          </span>
        </button>
      ))}
    </div>
  );
}
