import { useSearchStore } from '../store/searchStore';

export const usePagination = () => {
  const { filters, totalCount, results, setPage } = useSearchStore();

  const hasMore = results.length < totalCount;

  const loadNextPage = () => {
    if (hasMore) setPage(filters.page + 1);
  };

  return { hasMore, loadNextPage, currentPage: filters.page };
};