import { create } from 'zustand';
import type { Repository } from '../types/github';

interface CacheEntry {
  repos: Repository[];
  totalCount: number;
  timestamp: number;
}

interface CacheState {
  cache: Record<string, CacheEntry>;
  searchHistory: string[];

  setCache: (key: string, repos: Repository[], total: number) => void;
  getCache: (key: string) => CacheEntry | null;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const useCacheStore = create<CacheState>((set, get) => ({
  cache: {},
  searchHistory: [],

  setCache: (key, repos, total) =>
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: { repos, totalCount: total, timestamp: Date.now() },
      },
    })),

  getCache: (key) => {
    const entry = get().cache[key];
    if (!entry) return null;
    const isExpired = Date.now() - entry.timestamp > CACHE_TTL_MS;
    if (isExpired) return null;
    return entry;
  },

  addToHistory: (query) =>
    set((state) => ({
      searchHistory: [
        query,
        ...state.searchHistory.filter((q) => q !== query), // remove dup.
      ].slice(0, 10),
    })),

  clearHistory: () => set({ searchHistory: [], cache: {} }),
}));