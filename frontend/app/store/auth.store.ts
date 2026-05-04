import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  profilePicture?: string;
  role: 'STUDENT' | 'PROVIDER' | 'ADMIN';
  is2FAEnabled?: boolean;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, accessToken, isAuthenticated: true });
  },

  updateUser: (userData) => {
    set((state) => {
      const newUser = state.user ? { ...state.user, ...userData } : null;
      if (newUser) localStorage.setItem('user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },

  hydrate: () => {
    const accessToken = localStorage.getItem('accessToken');
    const userJson = localStorage.getItem('user');
    if (accessToken && userJson) {
      try {
        const user = JSON.parse(userJson);
        set({ user, accessToken, isAuthenticated: true, isHydrated: true });
      } catch {
        set({ isHydrated: true });
      }
    } else {
      set({ isHydrated: true });
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, accessToken: null, isAuthenticated: false });
  }
}));