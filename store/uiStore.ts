import { create } from 'zustand';

interface UIState {
  activeTab: 'search' | 'analytics';
  isExporting: boolean;
  exportError: string | null;
  showHistory: boolean;

  setActiveTab: (tab: 'search' | 'analytics') => void;
  setExporting: (val: boolean) => void;
  setExportError: (msg: string | null) => void;
  setShowHistory: (val: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'search',
  isExporting: false,
  exportError: null,
  showHistory: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setExporting: (val) => set({ isExporting: val }),
  setExportError: (msg) => set({ exportError: msg }),
  setShowHistory: (val) => set({ showHistory: val }),
}));