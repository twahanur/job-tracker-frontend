import { create } from 'zustand';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  candidateProfile?: {
    id: string;
    headline?: string | null;
    skills: string[];
    targetRoles: string[];
    minExpectedSalary?: number | null;
    targetSalary?: number | null;
  } | null;
  _count?: {
    cvs: number;
    jobs: number;
    notifications: number;
  };
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setTokens: (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    }
    set({ accessToken, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },
}));
