import { useCallback, useRef, useState } from 'react';
import { searchRepositories } from '../services/github';
import { loadCache, saveCache } from '../services/cache';
import { useSearchStore } from '../store/searchStore';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useCacheStore } from '../store/cacheStore';
import type { Repository, SortOption } from '../types/github';
import { computeAnalytics } from '../utils/analytics';

const buildKey = (
  query: string,
  language: string,
  sort: string,
  page: number
) => `${query}__${language}__${sort}__${page}`;

export const useSearch = () => {
  const searchStore = useSearchStore();
  const analyticsStore = useAnalyticsStore();
  const cacheStore = useCacheStore();

  const abortRef = useRef<AbortController | null>(null);

  // ref -> fresh results inside callback
  const resultsRef = useRef<Repository[]>([]);
  resultsRef.current = searchStore.results;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAnalytics = useCallback((repos: Repository[]) => {
    const a = computeAnalytics(repos);
    analyticsStore.setLanguageStats(a.languageStats);
    analyticsStore.setStarsByDate(a.starsByDate);
    analyticsStore.setForksVsStars(a.forksVsStars);
  }, []); 

  const search = useCallback(async (
    query: string,
    language: string,
    sort: SortOption,
    page: number,
    append: boolean = false
  ) => {
    const q = query.trim();
    if (!q) {
      searchStore.setResults([], 0);
      updateAnalytics([]);
      return;
    }

    // abort previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    const key = buildKey(q, language, sort, page);

    try {
      // cache check
      const cached = await loadCache(key);
      if (cached) {
        if (append) {
          const combined = [...resultsRef.current, ...cached.repos];
          searchStore.appendResults(cached.repos);
          updateAnalytics(combined);
        } else {
          searchStore.setResults(cached.repos, cached.totalCount);
          updateAnalytics(cached.repos);
        }
        setIsLoading(false);
        return;
      }

      // API call
      const data = await searchRepositories(q, language, sort, page);

      // check if this request was aborted
      if (controller.signal.aborted) return;

      if (append) {
        const combined = [...resultsRef.current, ...data.items];
        searchStore.appendResults(data.items);
        updateAnalytics(combined);
      } else {
        searchStore.setResults(data.items, data.total_count);
        updateAnalytics(data.items);
      }

      saveCache(key, data.items, data.total_count).catch(() => {});
      cacheStore.addToHistory(q);

    } catch (err) {
      if (controller.signal.aborted) return;
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [updateAnalytics]); 

  return {
    search,
    results: searchStore.results,
    totalCount: searchStore.totalCount,
    filters: searchStore.filters,
    isLoading,
    error,
    setLanguage: searchStore.setLanguage,
    setSort: searchStore.setSort,
    setPage: searchStore.setPage,
    setDateFrom: searchStore.setDateFrom,
    setDateTo: searchStore.setDateTo,
    resetFilters: searchStore.resetFilters,
  };
};