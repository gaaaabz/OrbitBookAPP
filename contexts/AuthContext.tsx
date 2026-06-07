import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../services/api';
import { authService } from '../services/authService';
import type { Usuario } from '../services/types';

const TOKEN_KEY = '@orbitbook:token';

interface AuthState {
  user: Usuario | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (token: string, user: Usuario) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    async function restore() {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY);
        if (stored) {
          setAuthToken(stored);
          const user = await authService.me();
          setState({ user, token: stored, isLoading: false });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        await AsyncStorage.removeItem(TOKEN_KEY);
        setAuthToken(null);
        setState({ user: null, token: null, isLoading: false });
      }
    }
    restore();
  }, []);

  async function signIn(token: string, user: Usuario) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    setState({ user, token, isLoading: false });
  }

  async function signOut() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setState({ user: null, token: null, isLoading: false });
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
