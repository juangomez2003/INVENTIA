import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AdminUser } from '../types'

interface AdminAuthContextType {
  adminUser: AdminUser | null
  isAdminAuthenticated: boolean
  adminLogin: (email: string, password: string) => Promise<boolean>
  adminLogout: () => void
  adminLoading: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

function isSuperAdmin(user: { user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }): boolean {
  return (
    user.user_metadata?.role === 'super_admin' ||
    user.app_metadata?.role === 'super_admin'
  )
}

const DEMO_EMAIL = 'admin@inventia.com'
const DEMO_PASSWORD = 'admin123'
const DEMO_TOKEN = 'demo-admin-token-inventia-2024'
const DEMO_ADMIN: AdminUser = { id: 'demo-admin', email: 'admin@inventia.com', fullName: 'Super Admin', role: 'super_admin' }

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [adminLoading, setAdminLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const init = async () => {
      try {
        const { supabase, isSupabaseConfigured } = await import('../lib/supabase')
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.auth.getSession()
          if (data.session?.user && isSuperAdmin(data.session.user)) {
            setAdminUser({ id: data.session.user.id, email: data.session.user.email || '', fullName: data.session.user.user_metadata?.full_name || null, role: 'super_admin' })
          }
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user && isSuperAdmin(session.user)) {
              setAdminUser({ id: session.user.id, email: session.user.email || '', fullName: session.user.user_metadata?.full_name || null, role: 'super_admin' })
            } else {
              setAdminUser(null)
            }
          })
          unsubscribe = () => subscription.unsubscribe()
          setAdminLoading(false)
          return
        }
      } catch { /* ignore */ }

      // Demo mode: restore from localStorage
      const saved = localStorage.getItem('inventia_admin_user')
      if (saved) { try { setAdminUser(JSON.parse(saved)) } catch { /* ignore */ } }
      setAdminLoading(false)
    }

    init()
    return () => { unsubscribe?.() }
  }, [])

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    // Demo credentials
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setAdminUser(DEMO_ADMIN)
      localStorage.setItem('inventia_admin_user', JSON.stringify(DEMO_ADMIN))
      localStorage.setItem('inventia_admin_token', DEMO_TOKEN)
      return true
    }

    try {
      const { supabase, isSupabaseConfigured } = await import('../lib/supabase')
      if (!isSupabaseConfigured || !supabase) return false
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) return false
      if (!isSuperAdmin(data.user)) {
        await supabase.auth.signOut()
        return false
      }
      setAdminUser({ id: data.user.id, email: data.user.email || '', fullName: data.user.user_metadata?.full_name || null, role: 'super_admin' })
      return true
    } catch { return false }
  }

  const adminLogout = async () => {
    try {
      const { supabase, isSupabaseConfigured } = await import('../lib/supabase')
      if (isSupabaseConfigured && supabase) await supabase.auth.signOut()
    } catch { /* ignore */ }
    setAdminUser(null)
    localStorage.removeItem('inventia_admin_user')
    localStorage.removeItem('inventia_admin_token')
  }

  return (
    <AdminAuthContext.Provider value={{ adminUser, isAdminAuthenticated: !!adminUser, adminLogin, adminLogout, adminLoading }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
