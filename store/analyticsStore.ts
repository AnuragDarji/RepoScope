import { create } from 'zustand';

interface LanguageStat {
  language: string;
  count: number;
}

interface StarsByDate {
  date: string;
  stars: number;
}

interface ForksVsStars {
  name: string;
  stars: number;
  forks: number;
}

interface AnalyticsState {
  languageStats: LanguageStat[];
  starsByDate: StarsByDate[];
  forksVsStars: ForksVsStars[];

  setLanguageStats: (data: LanguageStat[]) => void;
  setStarsByDate: (data: StarsByDate[]) => void;
  setForksVsStars: (data: ForksVsStars[]) => void;
  clearAnalytics: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  languageStats: [],
  starsByDate: [],
  forksVsStars: [],

  setLanguageStats: (data) => set({ languageStats: data }),
  setStarsByDate: (data) => set({ starsByDate: data }),
  setForksVsStars: (data) => set({ forksVsStars: data }),
  clearAnalytics: () =>
    set({ languageStats: [], starsByDate: [], forksVsStars: [] }),
}));