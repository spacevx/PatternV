export interface BuildResult {
  buildNumber: number;
  buildName: string;
  matchCount: number;
  offsets: string[];
  found: boolean;
}

export interface ScanResponse {
  id: number;
  pattern: string;
  timestamp: string;
  durationMs: number;
  results: BuildResult[];
  buildsTotal: number;
  buildsMatched: number;
  totalMatches: number;
}

export interface HistoryEntry {
  id: number;
  pattern: string;
  createdAt: string;
  durationMs: number;
  buildsTotal: number;
  buildsMatched: number;
  totalMatches: number;
}

export interface HistoryDetail extends HistoryEntry {
  results: BuildResult[];
}

export type ScanStatus = "idle" | "scanning" | "success" | "error";
