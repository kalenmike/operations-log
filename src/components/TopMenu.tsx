import { useEffect, useRef, useState } from "react";

interface TopMenuProps {
  onArchive: () => void;
}

export function TopMenu({ onArchive }: TopMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 border border-ink-600 bg-ink-800 text-parchment-100 text-xs uppercase tracking-widest font-mono cursor-pointer hover:bg-ink-700"
      >
        <span>Menu</span>
        <span className={`text-parchment-300 text-[9px] transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 min-w-[180px] border border-ink-800 bg-parchment-50 shadow-lg z-50">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onArchive();
            }}
            className="w-full text-left px-4 py-3 text-sm font-mono uppercase tracking-widest text-ink-700 hover:bg-parchment-100 cursor-pointer border-b border-parchment-200"
          >
            Archive
          </button>
          <div className="px-4 py-2 text-[10px] font-mono text-ink-400 uppercase tracking-wider">
            Logs · Metrics · Backups
          </div>
        </div>
      )}
    </div>
  );
}