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

      <main className="flex-1 flex flex-col items-center px-4 md:px-6 pt-6 pb-8 max-w-6xl mx-auto w-full">
        {/* Search input */}
        <div className="w-full max-w-4xl mb-6">
          <PatternInput
            onScan={handleScan}
            isScanning={scan.isScanning}
            initialPattern={inputPattern}
          />
        </div>

        {/* Content area: results + history side by side */}
        <div className="w-full flex gap-4 flex-1 min-h-0">
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
          <div className="hidden lg:block w-64 shrink-0 bg-bg-secondary rounded-md border border-border overflow-hidden">
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
    </>
  );
}
