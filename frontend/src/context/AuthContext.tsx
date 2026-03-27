import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_EMAIL = 'admin@restaurant.com';
const DEMO_PASSWORD = 'demo123';

const DEMO_USER: User = {
  id: 'demo-user',
  name: 'Carlos García',
  email: 'admin@restaurant.com',
  role: 'Admin',
  restaurant: 'La Casa del Sabor',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        const { auth, isConfigured } = await import('../lib/firebase');

        if (isConfigured && auth) {
          const { onAuthStateChanged } = await import('firebase/auth');
          unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              // Try to get full user info from backend
              try {
                const token = await firebaseUser.getIdToken();
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
                const res = await fetch(`${apiUrl}/auth/me`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                  const userData = await res.json();
                  setUser(userData);
                } else {
                  setUser({
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || firebaseUser.email || 'Usuario',
                    email: firebaseUser.email || '',
                    role: 'Admin',
                    restaurant: 'Mi Restaurante',
                  });
                }
              } catch {
                setUser({
                  id: firebaseUser.uid,
                  name: firebaseUser.displayName || firebaseUser.email || 'Usuario',
                  email: firebaseUser.email || '',
                  role: 'Admin',
                  restaurant: 'Mi Restaurante',
                });
              }
            } else {
              setUser(null);
            }
            setLoading(false);
          });
          return;
        }
      } catch {
        // Firebase not available, fall through to demo mode
      }

      // Demo mode - restore session from localStorage
      const saved = localStorage.getItem('inventia_user');
      if (saved) {
        try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
      }
      setLoading(false);
    };

    initAuth();
    return () => { unsubscribe?.(); };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo credentials always work
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setUser(DEMO_USER);
      localStorage.setItem('inventia_user', JSON.stringify(DEMO_USER));
      return true;
    }

    // Firebase Auth login
    try {
      const { auth, isConfigured } = await import('../lib/firebase');
      if (!isConfigured || !auth) return false;

      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        const res = await fetch(`${apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          setUser({
            id: result.user.uid,
            name: result.user.displayName || result.user.email || 'Usuario',
            email: result.user.email || '',
            role: 'Admin',
            restaurant: 'Mi Restaurante',
          });
        }
      } catch {
        setUser({
          id: result.user.uid,
          name: result.user.displayName || result.user.email || 'Usuario',
          email: result.user.email || '',
          role: 'Admin',
          restaurant: 'Mi Restaurante',
        });
      }
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { auth, isConfigured } = await import('../lib/firebase');
      if (isConfigured && auth) {
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
      }
    } catch { /* ignore */ }
    setUser(null);
    localStorage.removeItem('inventia_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
