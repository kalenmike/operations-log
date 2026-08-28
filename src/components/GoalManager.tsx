import { useState } from "react";
import { v4 as uuid } from "uuid";
import type { Goal } from "../types";

interface GoalManagerProps {
  goals: Goal[];
  onChange: (goals: Goal[]) => void;
}

const RECOMMENDED_MAX = 3;

export function GoalManager({ goals, onChange }: GoalManagerProps) {
  const [newGoal, setNewGoal] = useState("");

  const addGoal = () => {
    if (!newGoal.trim()) return;
    onChange([
      ...goals,
      { id: uuid(), text: newGoal.trim(), done: [false, false, false, false, false, false, false] },
    ]);
    setNewGoal("");
  };

  const updateGoal = (id: string, text: string) => {
    onChange(goals.map((g) => (g.id === id ? { ...g, text } : g)));
  };

  const removeGoal = (id: string) => {
    onChange(goals.filter((g) => g.id !== id));
  };

  const overLimit = goals.length > RECOMMENDED_MAX;

  return (
    <div className="space-y-3">
      <div className="border-b border-parchment-300 pb-1 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.2em] text-ink-400 font-mono">
          Objectives
        </h3>
        <span
          className={`text-xs font-mono font-bold ${
            overLimit ? "text-rust-500" : goals.length === RECOMMENDED_MAX ? "text-gold-500" : "text-olive-600"
          }`}
        >
          {goals.length}/{RECOMMENDED_MAX}
        </span>
      </div>

      {overLimit && (
        <p className="text-xs font-mono text-rust-600">
          Over recommended limit. 3 or fewer objectives keeps focus sharp.
        </p>
      )}

      {goals.length === 0 && (
        <p className="text-sm font-mono text-ink-400 italic">
          No objectives set. Add a few to define the week.
        </p>
      )}

      <div className="space-y-2">
        {goals.map((goal, index) => (
          <div key={goal.id} className="flex items-center gap-2">
            <input
              type="text"
              value={goal.text}
              onChange={(e) => updateGoal(goal.id, e.target.value)}
              aria-label={`Objective ${index + 1}`}
              className="flex-1 px-3 py-2 border border-parchment-300 bg-parchment-50 text-sm font-mono text-ink-700 placeholder:text-ink-300 focus:outline-none focus:border-ink-500"
            />
            <button
              type="button"
              onClick={() => removeGoal(goal.id)}
              className="text-rust-500 hover:text-rust-600 text-xs font-mono cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addGoal()}
          placeholder="Add objective..."
          aria-label="Add new objective"
          className="flex-1 px-3 py-2 border border-parchment-300 bg-parchment-50 text-sm font-mono text-ink-700 placeholder:text-ink-300 focus:outline-none focus:border-ink-500"
        />
        <button
          type="button"
          onClick={addGoal}
          className="px-4 py-2 border border-ink-600 bg-ink-800 text-parchment-100 text-xs uppercase tracking-widest font-mono cursor-pointer hover:bg-ink-700"
        >
          Add
        </button>
      </div>
    </div>
  );
}