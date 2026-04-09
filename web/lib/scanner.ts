import { spawn } from "child_process";
import path from "path";
import type { BuildResult } from "./types";

const EXE_PATH = path.resolve(
  /*turbopackIgnore: true*/ process.cwd(),
  process.env.PATTERNV_EXE_PATH || "../build/Release/PatternV.exe"
);
const BUILDS_DIR = path.resolve(
  /*turbopackIgnore: true*/ process.cwd(),
  process.env.BUILDS_DIR || "../builds"
);
const MAX_CONCURRENT =
  parseInt(process.env.MAX_CONCURRENT_SCANS || "3", 10) || 3;

// Simple promise-based semaphore
let running = 0;
const queue: (() => void)[] = [];

function acquireSemaphore(): Promise<void> {
  if (running < MAX_CONCURRENT) {
    running++;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    queue.push(() => {
      running++;
      resolve();
    });
  });
}

function releaseSemaphore(): void {
  running--;
  const next = queue.shift();
  if (next) next();
}

// Pattern validation: only hex chars, ?, and spaces
const VALID_PATTERN = /^[0-9a-fA-F?][0-9a-fA-F? ]*$/;
const VALID_TOKEN = /^([0-9a-fA-F]{2}|\?{1,2})$/;

export function validatePattern(pattern: string): string | null {
  const trimmed = pattern.trim();
  if (!trimmed) return "Pattern is empty";
  if (!VALID_PATTERN.test(trimmed)) return "Invalid characters in pattern";

  const tokens = trimmed.split(/\s+/);
  if (tokens.length < 2) return "Pattern must have at least 2 bytes";

  for (const token of tokens) {
    if (!VALID_TOKEN.test(token)) {
      return `Invalid byte: ${token}`;
    }
  }

  return null;
}

// Parse a single line of minified PatternV output
// Format: [+] GTA5_2060 (2 matches): 0xABCD, 0xEF01
// Format: [-] GTA5_1604 (0 matches)
const LINE_RE =
  /^\[([+-])\]\s+(\S+)\s+\((\d+)\s+match(?:es)?\)(?::\s+(.+))?$/;

export function parseLine(line: string): BuildResult | null {
  const m = line.match(LINE_RE);
  if (!m) return null;

  const found = m[1] === "+";
  const buildName = m[2];
  const matchCount = parseInt(m[3], 10);
  const offsets = m[4] ? m[4].split(",").map((s) => s.trim()) : [];

  const buildNumMatch = buildName.match(/(\d{4})/);
  const buildNumber = buildNumMatch ? parseInt(buildNumMatch[1], 10) : 0;

  return { buildName, buildNumber, matchCount, offsets, found };
}

export async function runScan(
  pattern: string,
  onResult?: (result: BuildResult) => void
): Promise<BuildResult[]> {
  await acquireSemaphore();

  try {
    return await new Promise<BuildResult[]>((resolve, reject) => {
      const proc = spawn(EXE_PATH, [BUILDS_DIR, pattern, "--no-color", "--minified", "--hide-time"]);

      const results: BuildResult[] = [];
      let stderr = "";
      let buffer = "";

      proc.stdout.on("data", (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split("\n");
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          const parsed = parseLine(trimmed);
          if (parsed) {
            results.push(parsed);
            onResult?.(parsed);
          }
        }
      });

      proc.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      proc.on("close", (code) => {
        // Process any remaining buffer
        if (buffer.trim()) {
          const parsed = parseLine(buffer.trim());
          if (parsed) {
            results.push(parsed);
            onResult?.(parsed);
          }
        }

        if (code === 1) {
          reject(new Error(stderr.trim() || "PatternV scan failed"));
        } else {
          // code 0 = all found, code 2 = some not found -- both are valid results
          results.sort((a, b) => a.buildNumber - b.buildNumber);
          resolve(results);
        }
      });

      proc.on("error", (err) => {
        reject(new Error(`Failed to start PatternV: ${err.message}`));
      });

      // Timeout after 120 seconds
      setTimeout(() => {
        proc.kill();
        reject(new Error("Scan timed out after 120 seconds"));
      }, 120_000);
    });
  } finally {
    releaseSemaphore();
  }
}
