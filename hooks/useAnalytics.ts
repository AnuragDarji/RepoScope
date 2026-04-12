import { useMemo } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useSearchStore } from '../store/searchStore';
import { computeAnalytics } from '../utils/analytics';

export const useAnalytics = () => {
  const { languageStats, starsByDate, forksVsStars } = useAnalyticsStore();
  const { results, filters } = useSearchStore();

  // Filter results by date range
  const filteredResults = useMemo(() => {
    return results.filter((repo) => {
      const updated = new Date(repo.updated_at).getTime();

      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom).getTime();
        if (updated < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo).getTime();
        if (updated > to) return false;
      }
      return true;
    });
  }, [results, filters.dateFrom, filters.dateTo]);

  // Recompute when date filter changes
  const computed = useMemo(
    () => computeAnalytics(filteredResults),
    [filteredResults]
  );

  return {
    languageStats: computed.languageStats,
    starsByDate: computed.starsByDate,
    forksVsStars: computed.forksVsStars,
    filteredResults,
    rawLanguageStats: languageStats,
    rawStarsByDate: starsByDate,
    rawForksVsStars: forksVsStars,
  };
};