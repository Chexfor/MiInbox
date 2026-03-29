import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import { authApi, type LoginCredentials, type UserProfile } from '../api/auth.api';

// ─── State Shape ─────────────────────────────────────────────────────────────

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: { token: string; user: UserProfile } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' };

// ─── Reducer ─────────────────────────────────────────────────────────────────

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return { ...state, isLoading: false, user: action.payload.user, token: action.payload.token, error: null };
    case 'AUTH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'AUTH_LOGOUT':
      return { user: null, token: null, isLoading: false, error: null };
    case 'AUTH_CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// ─── Context ─────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('auth_token'),
    isLoading: false,
    error: null,
  });

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const { data: tokenData } = await authApi.login(credentials);
      localStorage.setItem('auth_token', tokenData.access_token);

      const { data: profile } = await authApi.me();
      dispatch({ type: 'AUTH_SUCCESS', payload: { token: tokenData.access_token, user: profile } });
    } catch (err: any) {
      const message = err.response?.data?.message ?? 'Credenciales incorrectas.';
      dispatch({ type: 'AUTH_ERROR', payload: message });
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!localStorage.getItem('auth_token')) return;
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const { data } = await authApi.me();
      dispatch({ type: 'AUTH_SUCCESS', payload: { token: state.token!, user: data } });
    } catch {
      localStorage.removeItem('auth_token');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, [state.token]);

  const signOut = useCallback(async () => {
    try { await authApi.logout(); } finally {
      localStorage.removeItem('auth_token');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'AUTH_CLEAR_ERROR' }), []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, fetchProfile, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return ctx;
};
