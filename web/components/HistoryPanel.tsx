"use client";

import type { HistoryEntry } from "@/lib/types";
import HistoryItem from "./HistoryItem";

interface HistoryPanelProps {
  entries: HistoryEntry[];
  loading: boolean;
  activeId: number | null;
  onSelect: (entry: HistoryEntry) => void;
}

export default function HistoryPanel({
  entries,
  loading,
  activeId,
  onSelect,
}: HistoryPanelProps) {
  return (
    <aside className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 2xl:px-4 py-2.5 2xl:py-3 border-b border-border">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-text-muted"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="6" />
          <path d="M8 4.5V8l2.5 1.5" />
        </svg>
        <span className="text-xs 2xl:text-sm font-medium text-text-secondary">
          Recent Scans
        </span>
        {entries.length > 0 && (
          <span className="text-[10px] 2xl:text-xs text-text-muted ml-auto font-mono">
            {entries.length}
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && entries.length === 0 ? (
          <div className="flex flex-col gap-1 p-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="h-12 rounded bg-bg-secondary animate-pulse"
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-text-muted">No scans yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 2xl:gap-1 p-1 2xl:p-1.5">
            {entries.map((entry) => (
              <HistoryItem
                key={entry.id}
                entry={entry}
                isActive={activeId === entry.id}
                onClick={() => onSelect(entry)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
