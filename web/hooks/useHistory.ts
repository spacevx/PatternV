"use client";

import { useState, useEffect, useCallback } from "react";
import type { HistoryEntry, HistoryDetail } from "@/lib/types";

interface HistoryState {
  entries: HistoryEntry[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
}

export function useHistory() {
  const [state, setState] = useState<HistoryState>({
    entries: [],
    total: 0,
    page: 1,
    totalPages: 0,
    loading: true,
  });

  const fetchHistory = useCallback(async (page: number = 1) => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`/api/history?page=${page}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setState({
        entries: data.entries,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        loading: false,
      });
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchDetail = useCallback(async (id: number): Promise<HistoryDetail | null> => {
    try {
      const res = await fetch(`/api/history?id=${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  const refresh = useCallback(() => {
    fetchHistory(state.page);
  }, [fetchHistory, state.page]);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  return {
    ...state,
    fetchHistory,
    fetchDetail,
    refresh,
  };
}
