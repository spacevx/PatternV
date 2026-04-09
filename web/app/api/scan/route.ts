import { validatePattern, runScan, parseLine } from "@/lib/scanner";
import { insertSearch, getRecentSearch } from "@/lib/db";
import type { BuildResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { pattern?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const pattern = body.pattern?.trim().toUpperCase();
  if (!pattern) {
    return Response.json({ error: "Pattern is required" }, { status: 400 });
  }

  const validationError = validatePattern(pattern);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  // Check for recent identical scan (cache)
  const cached = getRecentSearch(pattern, 60);
  if (cached) {
    return Response.json(
      {
        id: cached.id,
        pattern: cached.pattern,
        timestamp: cached.createdAt,
        durationMs: cached.durationMs,
        results: cached.results,
        buildsTotal: cached.buildsTotal,
        buildsMatched: cached.buildsMatched,
        totalMatches: cached.totalMatches,
        cached: true,
      },
      { status: 200 }
    );
  }

  // SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      send("status", { state: "scanning" });

      const startTime = Date.now();
      const results: BuildResult[] = [];

      try {
        await runScan(pattern, (result) => {
          results.push(result);
          send("result", result);
        });
      } catch (err: any) {
        send("error", { message: err.message || "Scan failed" });
        controller.close();
        return;
      }

      const durationMs = Date.now() - startTime;
      results.sort((a, b) => a.buildNumber - b.buildNumber);

      // Save to database
      const searchId = insertSearch(pattern, results, durationMs);

      const buildsMatched = results.filter((r) => r.found).length;
      const totalMatches = results.reduce((sum, r) => sum + r.matchCount, 0);

      send("complete", {
        id: searchId,
        pattern,
        timestamp: new Date().toISOString(),
        durationMs,
        results,
        buildsTotal: results.length,
        buildsMatched,
        totalMatches,
      });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
