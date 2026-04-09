"use client";

import type { HistoryEntry } from "@/lib/types";

interface HistoryItemProps {
  entry: HistoryEntry;
  isActive: boolean;
  onClick: () => void;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr + "Z"); // SQLite stores UTC without Z
  const now = Date.now();
  const diffMs = now - date.getTime();
  const seconds = Math.floor(diffMs / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function HistoryItem({ entry, isActive, onClick }: HistoryItemProps) {
  const matchRatio = entry.buildsTotal > 0 ? entry.buildsMatched / entry.buildsTotal : 0;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left
        px-3 py-2.5 rounded-sm
        border-l-2 transition-all duration-100
        cursor-pointer
        ${isActive
          ? "bg-bg-tertiary border-l-accent"
          : "bg-transparent border-l-transparent hover:bg-bg-tertiary/50 hover:border-l-border-focus"
        }
      `}
    >
      {/* Pattern */}
      <div className="font-mono text-xs text-text-primary tracking-wider truncate">
        {entry.pattern}
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] text-text-muted">
          {timeAgo(entry.createdAt)}
        </span>
        <span className="text-[10px] text-text-muted">--</span>
        <span
          className={`font-mono text-[10px] font-medium ${
            matchRatio === 1
              ? "text-green"
              : matchRatio === 0
                ? "text-red"
                : "text-amber"
          }`}
        >
          {entry.buildsMatched}/{entry.buildsTotal}
        </span>
        {entry.durationMs > 0 && (
          <span className="text-[10px] text-text-muted ml-auto">
            {entry.durationMs}ms
          </span>
        )}
      </div>
    </button>
  );
}
