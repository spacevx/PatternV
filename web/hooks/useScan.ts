"use client";

import { useState, useCallback, useRef } from "react";
import type { BuildResult, ScanResponse, ScanStatus } from "@/lib/types";

interface ScanState {
  status: ScanStatus;
  pattern: string;
  results: BuildResult[];
  durationMs: number;
  searchId: number | null;
  error: string | null;
  startTime: number;
}

const INITIAL_STATE: ScanState = {
  status: "idle",
  pattern: "",
  results: [],
  durationMs: 0,
  searchId: null,
  error: null,
  startTime: 0,
};

export function useScan() {
  const [state, setState] = useState<ScanState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);

  const scan = useCallback(async (pattern: string) => {
    // Abort any existing scan
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({
      status: "scanning",
      pattern,
      results: [],
      durationMs: 0,
      searchId: null,
      error: null,
      startTime: Date.now(),
    });

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern }),
        signal: controller.signal,
      });

      // If the response is JSON (cached result), handle it directly
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data: ScanResponse & { cached?: boolean } = await res.json();
        if (!res.ok) {
          setState((prev) => ({
            ...prev,
            status: "error",
            error: (data as any).error || "Scan failed",
          }));
          return;
        }
        setState({
          status: "success",
          pattern: data.pattern,
          results: data.results,
          durationMs: data.durationMs,
          searchId: data.id,
          error: null,
          startTime: 0,
        });
        return;
      }

      // SSE stream
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split("\n\n");
        buffer = messages.pop() || "";

        for (const msg of messages) {
          const eventMatch = msg.match(/^event:\s*(.+)$/m);
          const dataMatch = msg.match(/^data:\s*(.+)$/m);
          if (!eventMatch || !dataMatch) continue;

          const eventType = eventMatch[1].trim();
          let data: any;
          try {
            data = JSON.parse(dataMatch[1]);
          } catch {
            continue;
          }

          if (eventType === "result") {
            setState((prev) => ({
              ...prev,
              results: [...prev.results, data as BuildResult],
            }));
          } else if (eventType === "complete") {
            setState({
              status: "success",
              pattern: data.pattern,
              results: data.results,
              durationMs: data.durationMs,
              searchId: data.id,
              error: null,
              startTime: 0,
            });
          } else if (eventType === "error") {
            setState((prev) => ({
              ...prev,
              status: "error",
              error: data.message || "Scan failed",
            }));
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err.message || "Network error",
      }));
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(INITIAL_STATE);
  }, []);

  const loadHistoryResult = useCallback(
    (data: {
      id: number;
      pattern: string;
      durationMs: number;
      results: BuildResult[];
    }) => {
      setState({
        status: "success",
        pattern: data.pattern,
        results: data.results,
        durationMs: data.durationMs,
        searchId: data.id,
        error: null,
        startTime: 0,
      });
    },
    []
  );

  return {
    ...state,
    scan,
    reset,
    loadHistoryResult,
    isScanning: state.status === "scanning",
  };
}
