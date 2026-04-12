import { create } from 'zustand';
import type { Repository, SearchFilters, SortOption } from '../types/github';

interface SearchState {
  results: Repository[];
  totalCount: number;
  filters: SearchFilters;
  isLoading: boolean;
  error: string | null;

  setResults: (repos: Repository[], total: number) => void;
  appendResults: (repos: Repository[]) => void;
  setLoading: (val: boolean) => void;
  setError: (msg: string | null) => void;
  setQuery: (query: string) => void;
  setLanguage: (lang: string) => void;
  setSort: (sort: SortOption) => void;
  setPage: (page: number) => void;
  setDateFrom: (date: string | null) => void;
  setDateTo: (date: string | null) => void;
  resetFilters: () => void;
}

const defaultFilters: SearchFilters = {
  query: '',
  language: '',
  sort: 'stars',
  page: 1,
  dateFrom: null,
  dateTo: null,
};

export const useSearchStore = create<SearchState>((set) => ({
  results: [],
  totalCount: 0,
  filters: defaultFilters,
  isLoading: false,
  error: null,

  setResults: (repos, total) =>
    set({ results: repos, totalCount: total }),

  appendResults: (repos) =>
    set((state) => ({ results: [...state.results, ...repos] })),

  setLoading: (val) => set({ isLoading: val }),
  setError: (msg) => set({ error: msg }),

  setQuery: (query) =>
    set((state) => ({ filters: { ...state.filters, query, page: 1 } })),

  setLanguage: (language) =>
    set((state) => ({ filters: { ...state.filters, language } })),

  setSort: (sort) =>
    set((state) => ({ filters: { ...state.filters, sort } })),

  setPage: (page) =>
    set((state) => ({ filters: { ...state.filters, page } })),

  setDateFrom: (dateFrom) =>
    set((state) => ({ filters: { ...state.filters, dateFrom } })),

  setDateTo: (dateTo) =>
    set((state) => ({ filters: { ...state.filters, dateTo } })),

  resetFilters: () =>
    set({ filters: defaultFilters, results: [], totalCount: 0 }),
}));