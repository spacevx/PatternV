"use client";

import { useState, useCallback, useRef, useEffect, type FormEvent, type ChangeEvent, type KeyboardEvent } from "react";

interface PatternInputProps {
  onScan: (pattern: string) => void;
  isScanning: boolean;
  initialPattern?: string;
}

/**
 * Validates an IDA-style byte pattern string.
 * Valid tokens: two-character hex pairs (e.g. "4A", "FF") or wildcard "??".
 * Returns null if valid, or an error message string if invalid.
 */
function validatePattern(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null; // empty is not "invalid", just empty

  const tokens = trimmed.split(/\s+/);

  for (const token of tokens) {
    if (token === "?" || token === "??") continue;
    if (token.length !== 2) return `Invalid token "${token}" -- each byte must be exactly 2 hex characters`;
    if (!/^[0-9A-Fa-f]{2}$/.test(token)) return `Invalid hex byte "${token}"`;
  }

  return null;
}

export default function PatternInput({ onScan, isScanning, initialPattern = "" }: PatternInputProps) {
  const [value, setValue] = useState(initialPattern);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = value.trim();
  const validationError = validatePattern(trimmed);
  const isEmpty = trimmed.length === 0;
  const isInvalid = !isEmpty && validationError !== null;
  const canSubmit = !isEmpty && !isInvalid && !isScanning;

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Sync initialPattern prop changes
  useEffect(() => {
    if (initialPattern) {
      setValue(initialPattern);
      setTouched(true);
    }
  }, [initialPattern]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    // Allow only hex chars, ?, and spaces -- auto-uppercase
    const raw = e.target.value;
    const cleaned = raw
      .toUpperCase()
      .replace(/[^0-9A-F? ]/g, "");
    setValue(cleaned);
    if (!touched) setTouched(true);
  }, [touched]);

  const handleSubmit = useCallback((e?: FormEvent) => {
    e?.preventDefault();
    if (canSubmit) {
      // Normalize whitespace before submitting
      const normalized = trimmed.replace(/\s+/g, " ");
      onScan(normalized);
    }
  }, [canSubmit, trimmed, onScan]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // Border color: red on invalid, accent-focus when focused (handled via peer), default border
  const borderClass = isInvalid && touched
    ? "border-red"
    : "border-border focus-within:border-border-focus";

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
      role="search"
      aria-label="Byte pattern search"
    >
      <div
        className={`
          flex items-center gap-0
          bg-bg-input rounded-[3px] border
          transition-all duration-200
          ${borderClass}
        `}
        style={isInvalid && touched ? { boxShadow: "0 0 0 1px var(--red-dim)" } : undefined}
      >
        {/* Hex prompt indicator */}
        <span
          className="select-none pl-3 2xl:pl-4 pr-1 text-text-muted font-mono text-sm 2xl:text-lg"
          aria-hidden="true"
        >
          {">"}
        </span>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="48 8B C4 ?? 55 41 56 48 83 EC 20"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          aria-label="Byte pattern"
          aria-invalid={isInvalid && touched}
          aria-describedby={isInvalid && touched ? "pattern-error" : undefined}
          className={`
            flex-1 min-w-0
            bg-transparent outline-none
            font-mono text-lg 2xl:text-xl tracking-wider
            text-text-primary placeholder:text-text-muted
            py-3 2xl:py-4 px-1 2xl:px-2
          `}
        />

        <button
          type="submit"
          disabled={!canSubmit}
          aria-label={isScanning ? "Scanning in progress" : "Scan pattern"}
          className={`
            flex items-center gap-2
            px-5 2xl:px-7 py-2 2xl:py-3 mr-1.5 2xl:mr-2
            rounded-[3px] font-mono text-sm 2xl:text-base font-medium uppercase tracking-[1px]
            border-2 border-transparent
            transition-all duration-200
            ${canSubmit
              ? "bg-accent text-white hover:bg-accent-hover border-accent hover:border-accent-hover cursor-pointer"
              : "bg-accent/20 text-accent/40 cursor-not-allowed opacity-50"
            }
          `}
          style={canSubmit ? { animation: "pulse-glow 2.5s ease-in-out infinite" } : undefined}
        >
          {isScanning ? (
            <>
              {/* Spinner */}
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="8" cy="8" r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="30 12"
                  strokeLinecap="round"
                />
              </svg>
              <span>Scanning</span>
            </>
          ) : (
            <>
              {/* Search / scan icon */}
              <svg
                className="w-4 h-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="6.5" cy="6.5" r="4.5" />
                <path d="M10 10l4 4" />
              </svg>
              <span>Scan</span>
            </>
          )}
        </button>
      </div>

      {/* Validation error */}
      {isInvalid && touched && (
        <p
          id="pattern-error"
          role="alert"
          className="mt-1.5 ml-1 text-xs 2xl:text-sm text-red font-mono"
          style={{ animation: "fadeSlideIn 0.2s ease-out" }}
        >
          {validationError}
        </p>
      )}
    </form>
  );
}
