"use client";

import { useCallback, useState } from "react";
import Header from "@/components/Header";
import PatternInput from "@/components/PatternInput";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import ScanResults from "@/components/ScanResults";
import ErrorState from "@/components/ErrorState";
import HistoryPanel from "@/components/HistoryPanel";
import type { HistoryEntry } from "@/lib/types";
import { useScan } from "@/hooks/useScan";
import { useHistory } from "@/hooks/useHistory";

export default function Home() {
  const scan = useScan();
  const history = useHistory();
  const [inputPattern, setInputPattern] = useState("");
  const [activeHistoryId, setActiveHistoryId] = useState<number | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  const handleScan = useCallback(
    (pattern: string) => {
      setInputPattern(pattern);
      setActiveHistoryId(null);
      scan.scan(pattern).then(() => {
        history.refresh();
      });
    },
    [scan, history]
  );

  const handleExampleSelect = useCallback(
    (pattern: string) => {
      setInputPattern(pattern);
    },
    []
  );

  const handleHistorySelect = useCallback(
    async (entry: HistoryEntry) => {
      setActiveHistoryId(entry.id);
      setInputPattern(entry.pattern);
      setMobileHistoryOpen(false);

      const detail = await history.fetchDetail(entry.id);
      if (detail) {
        scan.loadHistoryResult({
          id: detail.id,
          pattern: detail.pattern,
          durationMs: detail.durationMs,
          results: detail.results,
        });
      }
    },
    [history, scan]
  );

  const handleRetry = useCallback(() => {
    if (scan.pattern) {
      scan.scan(scan.pattern);
    }
  }, [scan]);

  return (
    <>
      <Header />

      <main className="flex-1 flex flex-col items-center px-4 md:px-6 2xl:px-10 pt-6 2xl:pt-10 pb-8 2xl:pb-12 max-w-7xl 2xl:max-w-[1920px] mx-auto w-full">
        {/* Search input */}
        <div className="w-full max-w-4xl 2xl:max-w-5xl mb-6 2xl:mb-10">
          <PatternInput
            onScan={handleScan}
            isScanning={scan.isScanning}
            initialPattern={inputPattern}
          />
        </div>

        {/* Content area: results + history side by side */}
        <div className="w-full flex gap-4 2xl:gap-6 flex-1 min-h-0">
          {/* Results */}
          <div className="flex-1 min-w-0">
            {scan.status === "idle" && (
              <EmptyState onSelect={handleExampleSelect} />
            )}

            {scan.status === "scanning" && (
              <LoadingState startTime={scan.startTime} />
            )}

            {scan.status === "success" && (
              <ScanResults
                results={scan.results}
                pattern={scan.pattern}
                durationMs={scan.durationMs}
              />
            )}

            {scan.status === "error" && (
              <ErrorState
                message={scan.error || "Unknown error"}
                onRetry={handleRetry}
              />
            )}
          </div>

          {/* History sidebar -- desktop */}
          <div className="hidden lg:block w-64 2xl:w-80 shrink-0 bg-bg-secondary rounded-[3px] border border-border overflow-hidden">
            <HistoryPanel
              entries={history.entries}
              loading={history.loading}
              activeId={activeHistoryId}
              onSelect={handleHistorySelect}
            />
          </div>
        </div>

        {/* Mobile history toggle */}
        <button
          onClick={() => setMobileHistoryOpen(!mobileHistoryOpen)}
          className="lg:hidden fixed bottom-4 right-4 z-40 w-10 h-10 rounded-full bg-bg-secondary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors shadow-lg cursor-pointer"
          aria-label="Toggle history"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="w-4 h-4"
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M8 4.5V8l2.5 1.5" />
          </svg>
        </button>

        {/* Mobile history drawer */}
        {mobileHistoryOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileHistoryOpen(false)}
            />
            <div className="lg:hidden fixed bottom-0 right-0 left-0 z-50 max-h-[60vh] bg-bg-secondary border-t border-border rounded-t-lg overflow-hidden">
              <HistoryPanel
                entries={history.entries}
                loading={history.loading}
                activeId={activeHistoryId}
                onSelect={handleHistorySelect}
              />
            </div>
          </>
        )}
      </main>

      <footer className="w-full border-t border-border py-4 2xl:py-6 px-4 md:px-6 2xl:px-10">
        <div className="max-w-7xl 2xl:max-w-[1920px] mx-auto flex items-center justify-center gap-3 2xl:gap-4 font-mono text-xs 2xl:text-sm text-text-muted">
          <span>
            Created by{" "}
            <a
              href="https://github.com/DaniGP17"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              danielgp
            </a>
          </span>
          <span aria-hidden="true">&middot;</span>
          <a
            href="https://github.com/DaniGP17/PatternV"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
        </div>
      </footer>
    </>
  );
}
