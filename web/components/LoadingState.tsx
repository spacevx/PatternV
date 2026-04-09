"use client";

import { useState, useEffect } from "react";

interface LoadingStateProps {
  startTime: number;
}

const SKELETON_ROWS = 15;

export default function LoadingState({ startTime }: LoadingStateProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 50); // Update ~20fps for smooth counter

    return () => clearInterval(interval);
  }, [startTime]);

  const elapsedSeconds = (elapsed / 1000).toFixed(1);

  return (
    <div className="w-full" role="status" aria-label="Scanning builds">
      {/* Timer header */}
      <div className="flex items-center gap-3 mb-4">
        {/* Pulsing dot */}
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
          <span
            className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"
            style={{ animation: "pulse-glow 1.5s ease-in-out infinite" }}
          />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
        </span>

        <span className="font-mono text-sm text-text-secondary">
          Scanning
          {/* Animated ellipsis */}
          <span style={{ animation: "blink 1s step-end infinite" }}>...</span>
        </span>

        <span className="font-mono text-sm text-amber tabular-nums">
          {elapsedSeconds}s
        </span>
      </div>

      {/* Skeleton rows */}
      <div className="flex flex-col gap-1">
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <div
            key={i}
            className="
              h-10 rounded
              bg-bg-secondary border border-border
              overflow-hidden relative
            "
          >
            {/* Shimmer sweep */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, var(--bg-tertiary) 50%, transparent 100%)",
                animation: `shimmer 1.8s ease-in-out infinite`,
                animationDelay: `${i * 50}ms`,
              }}
              aria-hidden="true"
            />

            {/* Faux content placeholders for visual rhythm */}
            <div className="flex items-center gap-3 px-3 h-full relative z-10">
              {/* Status indicator placeholder */}
              <div className="w-6 h-3 rounded-sm bg-bg-tertiary" />
              {/* Build name placeholder -- varied widths */}
              <div
                className="h-3 rounded-sm bg-bg-tertiary"
                style={{ width: `${60 + (i * 17) % 40}px` }}
              />
              {/* Build number placeholder */}
              <div className="h-3 w-12 rounded-sm bg-bg-tertiary" />
              {/* Offset placeholder */}
              <div
                className="h-3 rounded-sm bg-bg-tertiary ml-auto"
                style={{ width: `${40 + (i * 13) % 50}px` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Screen reader text */}
      <span className="sr-only">
        Scanning builds, {elapsedSeconds} seconds elapsed
      </span>
    </div>
  );
}
