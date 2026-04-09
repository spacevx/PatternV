"use client";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-12 flex items-center justify-between px-4 md:px-6 bg-bg-secondary/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 font-mono text-sm font-bold tracking-tight text-text-primary">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-4 h-4 text-accent"
            aria-hidden="true"
          >
            <path
              d="M2 3h12v1H2V3zm0 3h8v1H2V6zm0 3h10v1H2V9zm0 3h6v1H2v-1z"
              fill="currentColor"
            />
          </svg>
          <span>PatternV</span>
          <span
            className="inline-block w-[2px] h-4 bg-accent ml-0.5"
            style={{ animation: "blink 1s step-end infinite" }}
          />
        </div>
        <span className="hidden sm:inline text-xs text-text-muted font-mono ml-2">
          byte pattern scanner
        </span>
      </div>

      <a
        href="https://github.com/DaniGP17/PatternV"
        target="_blank"
        rel="noopener noreferrer"
        className="text-text-secondary hover:text-text-primary transition-colors"
        aria-label="GitHub repository"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
      </a>
    </header>
  );
}
