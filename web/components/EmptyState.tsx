interface EmptyStateProps {
  onSelect: (pattern: string) => void;
}

const EXAMPLE_PATTERNS = [
  "48 89 5C 24 ?? 57 48 83 EC 20",
  "E8 ?? ?? ?? ?? 48 8B D8",
  "40 53 48 83 EC 20 48 8B D9",
] as const;

export default function EmptyState({ onSelect }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 2xl:py-28 px-4 2xl:px-6">
      {/* Terminal / hex icon -- built with CSS + SVG */}
      <div className="relative mb-6">
        <div
          className="
            w-16 h-16 2xl:w-20 2xl:h-20 rounded-[3px]
            bg-bg-tertiary border border-border
            flex items-center justify-center
          "
        >
          {/* Stylized hex bytes in a mini grid */}
          <svg
            viewBox="0 0 32 32"
            fill="none"
            className="w-8 h-8 2xl:w-10 2xl:h-10"
            aria-hidden="true"
          >
            {/* Three rows of "bytes" -- small rectangles mimicking hex dump */}
            <rect x="2" y="6" width="6" height="3" rx="0.5" fill="var(--accent)" opacity="0.7" />
            <rect x="10" y="6" width="6" height="3" rx="0.5" fill="var(--text-muted)" />
            <rect x="18" y="6" width="6" height="3" rx="0.5" fill="var(--text-muted)" />
            <rect x="26" y="6" width="4" height="3" rx="0.5" fill="var(--accent)" opacity="0.4" />

            <rect x="2" y="13" width="6" height="3" rx="0.5" fill="var(--text-muted)" />
            <rect x="10" y="13" width="6" height="3" rx="0.5" fill="var(--amber)" opacity="0.5" />
            <rect x="18" y="13" width="6" height="3" rx="0.5" fill="var(--text-muted)" />
            <rect x="26" y="13" width="4" height="3" rx="0.5" fill="var(--text-muted)" />

            <rect x="2" y="20" width="6" height="3" rx="0.5" fill="var(--text-muted)" />
            <rect x="10" y="20" width="6" height="3" rx="0.5" fill="var(--text-muted)" />
            <rect x="18" y="20" width="6" height="3" rx="0.5" fill="var(--accent)" opacity="0.5" />
            <rect x="26" y="20" width="4" height="3" rx="0.5" fill="var(--text-muted)" />
          </svg>
        </div>

        {/* Subtle glow behind icon */}
        <div
          className="absolute inset-0 rounded-[3px] opacity-20 blur-xl pointer-events-none"
          style={{ background: "var(--accent)" }}
          aria-hidden="true"
        />
      </div>

      <h2 className="text-text-primary text-base 2xl:text-lg font-medium mb-1.5 2xl:mb-2">
        Enter a byte pattern to scan across all builds
      </h2>
      <p className="text-text-secondary text-sm 2xl:text-base mb-8 2xl:mb-10">
        Supports IDA-style signatures with{" "}
        <code className="font-mono text-amber px-1 py-0.5 bg-amber-dim rounded text-xs">
          ??
        </code>{" "}
        wildcards
      </p>

      {/* Example pattern chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 2xl:gap-3">
        <span className="text-text-muted text-xs 2xl:text-sm mr-1">Try:</span>
        {EXAMPLE_PATTERNS.map((pattern) => (
          <button
            key={pattern}
            onClick={() => onSelect(pattern)}
            className="
              font-mono text-xs 2xl:text-sm tracking-wider
              px-3 2xl:px-4 py-1.5 2xl:py-2 rounded
              bg-bg-tertiary border border-border
              text-text-secondary
              hover:text-text-primary hover:border-border-focus hover:bg-bg-secondary
              transition-all duration-200
              cursor-pointer
            "
            aria-label={`Use example pattern: ${pattern}`}
          >
            {pattern}
          </button>
        ))}
      </div>
    </div>
  );
}
