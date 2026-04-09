"use client";

import { useCallback, useState } from "react";

interface ScanStatsProps {
  buildsTotal: number;
  buildsMatched: number;
  totalMatches: number;
  durationMs: number;
  pattern: string;
}

export default function ScanStats({
  buildsTotal,
  buildsMatched,
  totalMatches,
  durationMs,
  pattern,
}: ScanStatsProps) {
  const [copied, setCopied] = useState(false);
  const buildsNotFound = buildsTotal - buildsMatched;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pattern);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback: silently fail if clipboard API unavailable
    }
  }, [pattern]);

  return (
    <div
      className="
        flex flex-wrap items-center gap-x-4 2xl:gap-x-6 gap-y-2
        px-3 2xl:px-5 py-2.5 2xl:py-3.5
        bg-bg-secondary rounded-[3px] border border-border
      "
      style={{ animation: "fadeSlideIn 0.3s ease-out" }}
      role="region"
      aria-label="Scan statistics"
    >
      {/* Pattern display + copy */}
      <div className="flex items-center gap-1.5 min-w-0">
        <code className="font-mono text-sm 2xl:text-base text-text-primary tracking-wider truncate max-w-[300px] 2xl:max-w-[500px]">
          {pattern}
        </code>
        <button
          onClick={handleCopy}
          className="
            shrink-0 p-1 rounded
            text-text-muted hover:text-text-secondary
            transition-colors duration-200
            cursor-pointer
          "
          aria-label={copied ? "Copied to clipboard" : "Copy pattern to clipboard"}
          title={copied ? "Copied!" : "Copy pattern"}
        >
          {copied ? (
            /* Checkmark icon */
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="var(--green)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
              aria-hidden="true"
            >
              <path d="M3 8.5l3 3 7-7" />
            </svg>
          ) : (
            /* Copy icon */
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
              aria-hidden="true"
            >
              <rect x="5" y="5" width="9" height="9" rx="1" />
              <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" />
            </svg>
          )}
        </button>
      </div>

      {/* Stat badges -- pushed to the right */}
      <div className="flex items-center gap-2 ml-auto flex-wrap">
        {/* Builds scanned */}
        <StatBadge
          value={buildsTotal}
          label="scanned"
          colorClass="text-text-secondary"
        />

        {/* Found */}
        <StatBadge
          value={buildsMatched}
          label="found"
          colorClass="text-green"
          bgClass="bg-green-dim"
        />

        {/* Not found */}
        <StatBadge
          value={buildsNotFound}
          label="not found"
          colorClass="text-red"
          bgClass="bg-red-dim"
        />

        {/* Duration */}
        <StatBadge
          value={`${durationMs}ms`}
          colorClass="text-amber"
          bgClass="bg-amber-dim"
        />
      </div>
    </div>
  );
}

function StatBadge({
  value,
  label,
  colorClass,
  bgClass,
}: {
  value: number | string;
  label?: string;
  colorClass: string;
  bgClass?: string;
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        font-mono text-xs 2xl:text-sm
        px-2 2xl:px-3 py-1 2xl:py-1.5 rounded-[3px]
        ${bgClass ?? "bg-bg-tertiary"}
        ${colorClass}
      `}
    >
      <span className="font-semibold tabular-nums">{value}</span>
      {label && <span className="text-text-muted">{label}</span>}
    </span>
  );
}
