import { create } from 'zustand';
import { createAuthSlice } from './slices/authSlice';
import { createUserSlice } from './slices/userSlice';
import { storageService } from '@/services/storage/localStorage';
import { STORAGE_KEYS } from '@/utils/constants';

const getInitialTheme = () => {
  const saved = storageService.getItem(STORAGE_KEYS.THEME);
  if (saved) return saved;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

export const useAppStore = create((set, get) => ({
  ...createAuthSlice(set, get),
  ...createUserSlice(set, get),

  // UI Layout State
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  // Theme State
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      storageService.setItem(STORAGE_KEYS.THEME, nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      return { theme: nextTheme };
    }),
}));
