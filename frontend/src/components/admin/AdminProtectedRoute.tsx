import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { isAdminAuthenticated, adminLoading } = useAdminAuth()

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0a0e1a 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-amber-300 text-sm">Verificando acceso admin...</p>
        </div>
      </div>
    )
  }

  if (!isAdminAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
