"use client";

import { useState, useCallback } from "react";
import type { BuildResult } from "@/lib/types";

interface BuildRowProps {
  result: BuildResult;
  index: number;
}

const MAX_VISIBLE_OFFSETS = 4;

export default function BuildRow({ result, index }: BuildRowProps) {
  const { buildNumber, buildName, matchCount, offsets, found } = result;
  const [expanded, setExpanded] = useState(false);

  const hasOverflow = offsets.length > MAX_VISIBLE_OFFSETS;
  const visibleOffsets = expanded ? offsets : offsets.slice(0, MAX_VISIBLE_OFFSETS);
  const hiddenCount = offsets.length - MAX_VISIBLE_OFFSETS;

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const statusIndicator = found ? "[+]" : "[-]";
  const statusColor = found ? "text-green" : "text-red";
  const bgTint = found ? "bg-green-dim" : "bg-red-dim";
  const borderColor = found ? "border-l-green" : "border-l-red";

  return (
    <div
      className={`
        flex items-start gap-3
        px-3 py-2.5
        rounded-sm
        border-l-2 ${borderColor}
        ${bgTint}
        hover:brightness-125
        transition-all duration-100
      `}
      style={{
        animation: "fadeSlideIn 0.3s ease-out both",
        animationDelay: `${index * 50}ms`,
      }}
      role="listitem"
    >
      {/* Status indicator: [+] or [-] */}
      <span
        className={`font-mono text-sm font-bold ${statusColor} shrink-0 select-none`}
        aria-label={found ? "Found" : "Not found"}
      >
        {statusIndicator}
      </span>

      {/* Build info */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0 flex-1">
        {/* Build name + number */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-text-secondary truncate max-w-[140px]">
            {buildName}
          </span>
          <span className="font-mono text-sm font-bold text-amber">
            v{buildNumber}
          </span>
        </div>

        {/* Match count */}
        <span className={`font-mono text-xs ${found ? "text-green" : "text-red"}`}>
          {matchCount === 0
            ? "no matches"
            : matchCount === 1
              ? "1 match"
              : `${matchCount} matches`}
        </span>

        {/* Offsets */}
        {found && offsets.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap ml-0 sm:ml-auto">
            {visibleOffsets.map((offset) => (
              <code
                key={offset}
                className="
                  font-mono text-xs text-amber
                  px-1.5 py-0.5
                  bg-amber-dim rounded-sm
                "
              >
                {offset}
              </code>
            ))}

            {hasOverflow && (
              <button
                onClick={toggleExpand}
                className="
                  font-mono text-xs
                  px-1.5 py-0.5 rounded-sm
                  text-text-secondary
                  hover:text-text-primary hover:bg-bg-tertiary
                  transition-colors duration-100
                  cursor-pointer
                "
                aria-label={expanded ? "Show fewer offsets" : `Show ${hiddenCount} more offsets`}
                aria-expanded={expanded}
              >
                {expanded ? "show less" : `+${hiddenCount} more`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
