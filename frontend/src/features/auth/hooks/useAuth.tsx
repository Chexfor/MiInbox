import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
  type JSX,
} from 'react';
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
    case 'AUTH_LOADING':     return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':     return { ...state, isLoading: false, user: action.payload.user, token: action.payload.token, error: null };
    case 'AUTH_ERROR':       return { ...state, isLoading: false, error: action.payload };
    case 'AUTH_LOGOUT':      return { user: null, token: null, isLoading: false, error: null };
    case 'AUTH_CLEAR_ERROR': return { ...state, error: null };
    default:                 return state;
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

export const AuthProvider = ({ children }: { children: ReactNode }): JSX.Element => {
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
      const status = err?.response?.status;
      const msg = err?.response?.data?.message ?? 'Credenciales incorrectas.';
      
      if (status === 409) {
        dispatch({ type: 'AUTH_CLEAR_ERROR' });
        // Usar un navegador nativo para confirmación simple
        if (window.confirm(msg + '\n\nSi aceptas, la otra sesión será cerrada.')) {
          // Reintentar con force = true
          return signIn({ ...credentials, force: true });
        }
        return; // Usuario canceló
      }

      dispatch({ type: 'AUTH_ERROR', payload: msg });
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

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch({ type: 'AUTH_LOGOUT' });
    };
    window.addEventListener('auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth_unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    if (state.user) {
      const channel = `user.${state.user.id}`;
      // @ts-ignore - window.Echo is globally defined in main.tsx/echo.config.ts
      const echo = window.Echo;
      
      if (echo) {
        echo.private(channel).listen('.session.kicked', () => {
          localStorage.removeItem('auth_token');
          dispatch({ type: 'AUTH_LOGOUT' });
          
          import('react-hot-toast').then(({ toast }) => {
            toast.error('Tu sesión ha iniciado en otro dispositivo. Se ha cerrado esta sesión.', { duration: 6000 });
          });

          // Forzar recarga completa para "matar" hilos de Echo y persistencia residual
          setTimeout(() => {
            window.location.reload();
          }, 500);
        });

        return () => {
          echo.leave(channel);
        };
      }
    }
  }, [state.user]);

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
