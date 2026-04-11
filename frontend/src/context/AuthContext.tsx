import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<'super_admin' | 'user' | false>;
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function fetchUserInfo(token: string): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) return await res.json();
  } catch { /* ignore */ }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Demo mode — restore session from localStorage
      const saved = localStorage.getItem('inventia_user');
      if (saved) {
        try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
      }
      setLoading(false);
      return;
    }

    // Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const token = session.access_token;
          const info = await fetchUserInfo(token);
          if (info) {
            setUser(info);
          } else {
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email || 'Usuario',
              email: session.user.email || '',
              role: 'Admin',
              restaurant: session.user.user_metadata?.restaurant_name || 'Mi Restaurante',
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => { subscription.unsubscribe(); };
  }, []);

  const login = async (email: string, password: string): Promise<'super_admin' | 'user' | false> => {
    // Demo credentials always work
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setUser(DEMO_USER);
      localStorage.setItem('inventia_user', JSON.stringify(DEMO_USER));
      return 'user';
    }

    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        console.error('Login error:', error?.message);
        return false;
      }
      // Detect super_admin from Supabase metadata
      const meta = data.user?.user_metadata || {};
      const appMeta = data.user?.app_metadata || {};
      const role = meta.role || appMeta.role || '';
      if (role === 'super_admin') {
        // Store admin session for the admin context
        localStorage.setItem('inventia_admin_token', data.session.access_token);
        return 'super_admin';
      }
      // onAuthStateChange will handle setUser for regular users
      return 'user';
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
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
