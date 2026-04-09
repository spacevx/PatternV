import type { BuildResult } from "@/lib/types";
import ScanStats from "./ScanStats";
import BuildRow from "./BuildRow";

interface ScanResultsProps {
  results: BuildResult[];
  pattern: string;
  durationMs: number;
}

export default function ScanResults({ results, pattern, durationMs }: ScanResultsProps) {
  const buildsTotal = results.length;
  const buildsMatched = results.filter((r) => r.found).length;
  const totalMatches = results.reduce((sum, r) => sum + r.matchCount, 0);

  // Sort: found builds first, then by build number descending
  const sorted = [...results].sort((a, b) => {
    if (a.found !== b.found) return a.found ? -1 : 1;
    return b.buildNumber - a.buildNumber;
  });

  return (
    <div className="w-full flex flex-col gap-3">
      <ScanStats
        buildsTotal={buildsTotal}
        buildsMatched={buildsMatched}
        totalMatches={totalMatches}
        durationMs={durationMs}
        pattern={pattern}
      />

      {/* Results list */}
      <div className="flex flex-col gap-1" role="list" aria-label="Build scan results">
        {sorted.map((result, i) => (
          <BuildRow key={result.buildNumber} result={result} index={i} />
        ))}
      </div>

      {/* Footer summary */}
      {buildsTotal > 0 && (
        <p className="text-center text-xs text-text-muted font-mono pt-2">
          {buildsTotal} builds scanned -- {buildsMatched} matched -- {totalMatches} total offsets
        </p>
      )}
    </div>
  );
}
