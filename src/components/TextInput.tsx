import { useId } from "react";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  rows = 3,
  className = "",
}: TextInputProps) {
  const id = useId();
  const baseClass =
    "w-full px-3 py-2 border border-parchment-300 bg-parchment-50 text-sm font-mono text-ink-700 placeholder:text-ink-300 focus:outline-none focus:border-ink-500 resize-none";

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="text-xs uppercase tracking-[0.2em] text-ink-400 font-mono">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={baseClass}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
    </div>
  );
}