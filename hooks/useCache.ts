import { useCacheStore } from '../store/cacheStore';
import { clearAllCache } from '../services/cache';

export const useCache = () => {
  const { searchHistory, clearHistory: clearStoreHistory } = useCacheStore();

  const clearHistory = async () => {
    clearStoreHistory();     // clear mem.
    await clearAllCache();  // clear async storage.
  };

  return { searchHistory, clearHistory };
};