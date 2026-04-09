import Database from "better-sqlite3";
import path from "path";
import type { BuildResult, HistoryEntry, HistoryDetail } from "./types";

const DB_PATH = path.resolve(/*turbopackIgnore: true*/ process.cwd(), "db", "patternv.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  // Ensure db directory exists
  const fs = require("fs");
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");

  _db.exec(`
    CREATE TABLE IF NOT EXISTS searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern TEXT NOT NULL,
      total_matches INTEGER NOT NULL DEFAULT 0,
      builds_matched INTEGER NOT NULL DEFAULT 0,
      builds_total INTEGER NOT NULL DEFAULT 0,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS search_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      search_id INTEGER NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
      build_number INTEGER NOT NULL,
      build_name TEXT NOT NULL,
      match_count INTEGER NOT NULL,
      offsets TEXT NOT NULL DEFAULT '[]'
    );

    CREATE INDEX IF NOT EXISTS idx_searches_created ON searches(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_search_results_search ON search_results(search_id);
  `);

  return _db;
}

export function insertSearch(
  pattern: string,
  results: BuildResult[],
  durationMs: number
): number {
  const db = getDb();
  const buildsMatched = results.filter((r) => r.found).length;
  const totalMatches = results.reduce((sum, r) => sum + r.matchCount, 0);

  const insertSearchStmt = db.prepare(`
    INSERT INTO searches (pattern, total_matches, builds_matched, builds_total, duration_ms)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertResultStmt = db.prepare(`
    INSERT INTO search_results (search_id, build_number, build_name, match_count, offsets)
    VALUES (?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    const info = insertSearchStmt.run(
      pattern,
      totalMatches,
      buildsMatched,
      results.length,
      durationMs
    );
    const searchId = info.lastInsertRowid as number;

    for (const r of results) {
      insertResultStmt.run(
        searchId,
        r.buildNumber,
        r.buildName,
        r.matchCount,
        JSON.stringify(r.offsets)
      );
    }

    return searchId;
  });

  return transaction();
}

export function getRecentSearch(
  pattern: string,
  withinSeconds: number = 60
): HistoryDetail | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT * FROM searches
     WHERE pattern = ? AND created_at > datetime('now', '-' || ? || ' seconds')
     ORDER BY created_at DESC LIMIT 1`
    )
    .get(pattern, withinSeconds) as any;

  if (!row) return null;

  const results = db
    .prepare(`SELECT * FROM search_results WHERE search_id = ? ORDER BY build_number ASC`)
    .all(row.id) as any[];

  return {
    id: row.id,
    pattern: row.pattern,
    createdAt: row.created_at,
    durationMs: row.duration_ms,
    buildsTotal: row.builds_total,
    buildsMatched: row.builds_matched,
    totalMatches: row.total_matches,
    results: results.map((r: any) => ({
      buildNumber: r.build_number,
      buildName: r.build_name,
      matchCount: r.match_count,
      offsets: JSON.parse(r.offsets),
      found: r.match_count > 0,
    })),
  };
}

export function getHistory(
  page: number = 1,
  limit: number = 20
): { entries: HistoryEntry[]; total: number } {
  const db = getDb();
  const offset = (page - 1) * limit;

  const total = (
    db.prepare("SELECT COUNT(*) as count FROM searches").get() as any
  ).count;

  const rows = db
    .prepare(
      `SELECT * FROM searches ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    .all(limit, offset) as any[];

  return {
    total,
    entries: rows.map((row: any) => ({
      id: row.id,
      pattern: row.pattern,
      createdAt: row.created_at,
      durationMs: row.duration_ms,
      buildsTotal: row.builds_total,
      buildsMatched: row.builds_matched,
      totalMatches: row.total_matches,
    })),
  };
}

export function getSearchById(id: number): HistoryDetail | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM searches WHERE id = ?").get(id) as any;
  if (!row) return null;

  const results = db
    .prepare(`SELECT * FROM search_results WHERE search_id = ? ORDER BY build_number ASC`)
    .all(id) as any[];

  return {
    id: row.id,
    pattern: row.pattern,
    createdAt: row.created_at,
    durationMs: row.duration_ms,
    buildsTotal: row.builds_total,
    buildsMatched: row.builds_matched,
    totalMatches: row.total_matches,
    results: results.map((r: any) => ({
      buildNumber: r.build_number,
      buildName: r.build_name,
      matchCount: r.match_count,
      offsets: JSON.parse(r.offsets),
      found: r.match_count > 0,
    })),
  };
}
