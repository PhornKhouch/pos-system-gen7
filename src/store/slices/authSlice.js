import { storageService } from '@/services/storage/localStorage';
import { STORAGE_KEYS } from '@/utils/constants';

export const createAuthSlice = (set) => ({
  user: storageService.getItem(STORAGE_KEYS.USER_DATA, null),
  token: storageService.getItem(STORAGE_KEYS.AUTH_TOKEN, null),
  isAuthenticated: !!storageService.getItem(STORAGE_KEYS.AUTH_TOKEN, null),

  setAuth: (user, token) => {
    storageService.setItem(STORAGE_KEYS.USER_DATA, user);
    storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    storageService.removeItem(STORAGE_KEYS.USER_DATA);
    storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    set({ user: null, token: null, isAuthenticated: false });
  },
});
