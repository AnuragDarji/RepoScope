import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Repository } from '../types/github';

const PREFIX = 'rs__';
const TTL = 5 * 60 * 1000;

interface CacheEntry {
  repos: Repository[];
  totalCount: number; 
  timestamp: number;
}

const memoryCache: Record<string, CacheEntry> = {};

export const saveCache = async (
  key: string,
  repos: Repository[],
  totalCount: number
): Promise<void> => {
  const entry: CacheEntry = { repos, totalCount, timestamp: Date.now() };
  memoryCache[key] = entry;
  try {
    await AsyncStorage.setItem(`${PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    
  }
};

export const loadCache = async (
  key: string
): Promise<CacheEntry | null> => {
  
  const mem = memoryCache[key];
  if (mem) {
    if (Date.now() - mem.timestamp < TTL) return mem;
    delete memoryCache[key];
  }


  try {
    const raw = await AsyncStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.timestamp > TTL) {
      await AsyncStorage.removeItem(`${PREFIX}${key}`);
      return null;
    }
    memoryCache[key] = entry;
    return entry;
  } catch {
    return null;
  }
};

export const clearAllCache = async (): Promise<void> => {
  Object.keys(memoryCache).forEach((k) => delete memoryCache[k]);
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(PREFIX));
    if (cacheKeys.length > 0) await AsyncStorage.multiRemove(cacheKeys);
  } catch {
    
  }
};

